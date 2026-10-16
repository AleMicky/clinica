using System.Globalization;
using Clinica.Api.Data;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;
using ExistenciaPartidaEntity = Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity.ExistenciaPartida;
using MarcaEntity = Clinica.Api.Modules.Almacenes.Marca.Entity.Marca;
using PartidaInventarioEntity = Clinica.Api.Modules.Almacenes.PartidaInventario.Entity.PartidaInventario;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using UnidadesMedidaEntity = Clinica.Api.Modules.Parametros.UnidadesMedida.Entity.UnidadesMedida;

namespace Clinica.Api.Modules.Almacenes.Producto.Services;

public sealed class ProductoImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IProductoImportacionService
{
    public async Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default)
    {
        var filas = excelReader.Read(archivo);

        var resultado = new ExcelImportResult
        {
            Total = filas.Count
        };

        if (filas.Count == 0)
        {
            resultado.Errors.Add(new ExcelImportError
            {
                Row = 0,
                Column = null,
                Value = null,
                Message = "El archivo Excel no contiene registros."
            });

            return resultado;
        }

        ValidarColumnas(filas, resultado);

        if (resultado.Errors.Count > 0)
            return resultado;

        // 1. Cargar catálogos activos para mapeo en memoria
        var categorias = await dbContext.CategoriasProducto
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var marcas = await dbContext.Marcas
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var proveedores = await dbContext.Proveedores
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var unidadesMedida = await dbContext.UnidadesMedida
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var almacenes = await dbContext.Almacenes
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var categoriasMap = ConstruirCategoriasMap(categorias);
        var marcasMap = ConstruirMarcasMap(marcas);
        var proveedoresMap = ConstruirProveedoresMap(proveedores);
        var unidadesMap = ConstruirUnidadesMap(unidadesMedida);
        var almacenesMap = ConstruirAlmacenesMap(almacenes);

        // 2. Extraer códigos de productos del Excel
        var codigosExcel = filas
            .Select(x => NormalizarCodigo(x.Get("CODIGO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 3. Consultar productos existentes en BD
        var productosExistentesDb = await dbContext.Productos
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .ToListAsync(cancellationToken);

        var productosExistentesMap = productosExistentesDb
            .ToDictionary(x => x.Codigo, x => x, StringComparer.OrdinalIgnoreCase);

        // 4. Consultar partidas de inventario existentes en BD para los productos existentes
        var productosExistentesIds = productosExistentesDb.Select(x => x.Id).ToList();
        var partidasExistentesDb = await dbContext.PartidasInventario
            .AsNoTracking()
            .Where(x => productosExistentesIds.Contains(x.ProductoId) && x.NumeroPartida != null && x.Activo)
            .Select(x => new { x.Id, x.ProductoId, x.NumeroPartida })
            .ToListAsync(cancellationToken);

        var partidasExistentesDbSet = partidasExistentesDb
            .Select(x => $"{x.ProductoId}|{x.NumeroPartida!.ToUpperInvariant()}")
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var partidasExistentesDbMap = partidasExistentesDb
            .ToDictionary(x => $"{x.ProductoId}|{x.NumeroPartida!.ToUpperInvariant()}", x => x.Id, StringComparer.OrdinalIgnoreCase);

        // 5. Consultar existencias existentes en BD para los productos existentes (Tracked para actualizar cantidades)
        var existenciasDb = await dbContext.Existencias
            .Where(x => productosExistentesIds.Contains(x.ProductoId) && x.Activo)
            .ToListAsync(cancellationToken);

        var existenciasDbMap = existenciasDb
            .ToDictionary(x => $"{x.AlmacenId}|{x.ProductoId}", x => x);

        var existenciasIds = existenciasDb.Select(x => x.Id).ToList();
        var existenciasPartidasDb = await dbContext.ExistenciasPartidas
            .Where(x => existenciasIds.Contains(x.ExistenciaId) && x.Activo)
            .ToListAsync(cancellationToken);

        var existenciasPartidasDbMap = existenciasPartidasDb
            .ToDictionary(x => $"{x.ExistenciaId}|{x.PartidaInventarioId}", x => x);

        // 6. Estructuras para seguimiento en memoria durante el procesamiento
        var productosNuevosMap = new Dictionary<string, ProductoEntity>(StringComparer.OrdinalIgnoreCase);
        var partidasNuevas = new List<PartidaInventarioEntity>();
        var partidasProcesadasPorProducto = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var existenciasNuevasMap = new Dictionary<string, ExistenciaEntity>(StringComparer.OrdinalIgnoreCase);
        var existenciasPartidasNuevas = new List<ExistenciaPartidaEntity>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                productosNuevosMap,
                partidasNuevas,
                existenciasNuevasMap,
                existenciasPartidasNuevas,
                categoriasMap,
                marcasMap,
                proveedoresMap,
                unidadesMap,
                almacenesMap,
                productosExistentesMap,
                partidasExistentesDbSet,
                partidasExistentesDbMap,
                partidasProcesadasPorProducto,
                existenciasDbMap,
                existenciasPartidasDbMap,
                resultado);
        }

        if (productosNuevosMap.Count == 0 &&
            partidasNuevas.Count == 0 &&
            existenciasNuevasMap.Count == 0 &&
            existenciasPartidasNuevas.Count == 0 &&
            !dbContext.ChangeTracker.HasChanges())
        {
            return resultado;
        }

        // 7. Persistir entidades
        if (productosNuevosMap.Count > 0)
        {
            await dbContext.Productos.AddRangeAsync(productosNuevosMap.Values, cancellationToken);
        }

        if (partidasNuevas.Count > 0)
        {
            await dbContext.PartidasInventario.AddRangeAsync(partidasNuevas, cancellationToken);
        }

        if (existenciasNuevasMap.Count > 0)
        {
            await dbContext.Existencias.AddRangeAsync(existenciasNuevasMap.Values, cancellationToken);
        }

        if (existenciasPartidasNuevas.Count > 0)
        {
            await dbContext.ExistenciasPartidas.AddRangeAsync(existenciasPartidasNuevas, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = productosNuevosMap.Count > 0
            ? productosNuevosMap.Count
            : (partidasNuevas.Count > 0 ? partidasNuevas.Count : (existenciasNuevasMap.Count + existenciasPartidasNuevas.Count));

        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        Dictionary<string, ProductoEntity> productosNuevosMap,
        List<PartidaInventarioEntity> partidasNuevas,
        Dictionary<string, ExistenciaEntity> existenciasNuevasMap,
        List<ExistenciaPartidaEntity> existenciasPartidasNuevas,
        Dictionary<string, int> categoriasMap,
        Dictionary<string, int> marcasMap,
        Dictionary<string, int> proveedoresMap,
        Dictionary<string, int> unidadesMap,
        Dictionary<string, int> almacenesMap,
        Dictionary<string, ProductoEntity> productosExistentesMap,
        HashSet<string> partidasExistentesDbSet,
        Dictionary<string, int> partidasExistentesDbMap,
        HashSet<string> partidasProcesadasPorProducto,
        Dictionary<string, ExistenciaEntity> existenciasDbMap,
        Dictionary<string, ExistenciaPartidaEntity> existenciasPartidasDbMap,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        // Lectura de campos de Producto
        var codigo = NormalizarCodigo(fila.Get("CODIGO"));
        var nombre = NormalizarTexto(fila.Get("NOMBRE"));
        var descripcion = NormalizarTexto(fila.Get("DESCRIPCION"));
        var categoriaTexto = NormalizarTexto(fila.Get("CATEGORIA"));
        var marcaTexto = NormalizarTexto(fila.Get("MARCA"));
        var proveedorTexto = NormalizarTexto(fila.Get("PROVEEDOR"));
        var unidadTexto = NormalizarTexto(fila.Get("UNIDAD_MEDIDA"));
        var precioVentaTexto = NormalizarTexto(fila.Get("PRECIO_VENTA") ?? fila.Get("PRECIO"));
        var controlaVencimientoTexto = NormalizarTexto(fila.Get("CONTROLA_VENCIMIENTO"));
        var stockMinimoTexto = NormalizarTexto(fila.Get("STOCK_MINIMO"));
        var stockMaximoTexto = NormalizarTexto(fila.Get("STOCK_MAXIMO"));

        // Lectura de campos de Partida de Inventario
        var numeroPartida = NormalizarNumeroPartida(fila.Get("NUMERO_PARTIDA") ?? fila.Get("NUMERO_LOTE") ?? fila.Get("PARTIDA"));
        var fechaVencimientoTexto = NormalizarTexto(fila.Get("FECHA_VENCIMIENTO"));
        var costoUnitarioTexto = NormalizarTexto(fila.Get("COSTO_UNITARIO") ?? fila.Get("COSTO"));

        // Lectura de campos de Existencia / Stock inicial
        var almacenTexto = NormalizarTexto(fila.Get("ALMACEN"));
        var cantidadTexto = NormalizarTexto(fila.Get("CANTIDAD") ?? fila.Get("CANTIDAD_INICIAL") ?? fila.Get("STOCK") ?? fila.Get("STOCK_INICIAL"));

        // Validación Producto: Código
        if (string.IsNullOrWhiteSpace(codigo))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código del producto es obligatorio.");
            tieneError = true;
        }
        else if (codigo.Length > 20)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código del producto no puede exceder los 20 caracteres.");
            tieneError = true;
        }

        // Validación Producto: Nombre
        if (string.IsNullOrWhiteSpace(nombre))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE",
                nombre,
                "El nombre del producto es obligatorio.");
            tieneError = true;
        }
        else if (nombre.Length > 150)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE",
                nombre,
                "El nombre del producto no puede exceder los 150 caracteres.");
            tieneError = true;
        }

        // Validación Producto: Descripción (Opcional)
        if (descripcion?.Length > 500)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "DESCRIPCION",
                descripcion,
                "La descripción no puede exceder los 500 caracteres.");
            tieneError = true;
        }

        // Validación Producto: Categoría
        var categoriaId = 0;
        if (string.IsNullOrWhiteSpace(categoriaTexto))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CATEGORIA",
                categoriaTexto,
                "La categoría es obligatoria.");
            tieneError = true;
        }
        else if (!categoriasMap.TryGetValue(categoriaTexto.ToUpperInvariant(), out categoriaId))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CATEGORIA",
                categoriaTexto,
                $"No se encontró la categoría '{categoriaTexto}'.");
            tieneError = true;
        }

        // Validación Producto: Marca (Opcional)
        int? marcaId = null;
        if (!string.IsNullOrWhiteSpace(marcaTexto))
        {
            if (marcasMap.TryGetValue(marcaTexto.ToUpperInvariant(), out var mId))
            {
                marcaId = mId;
            }
            else
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "MARCA",
                    marcaTexto,
                    $"No se encontró la marca '{marcaTexto}'.");
                tieneError = true;
            }
        }

        // Validación Producto: Proveedor (Opcional)
        int? proveedorId = null;
        if (!string.IsNullOrWhiteSpace(proveedorTexto))
        {
            if (proveedoresMap.TryGetValue(proveedorTexto.ToUpperInvariant(), out var pId))
            {
                proveedorId = pId;
            }
            else
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "PROVEEDOR",
                    proveedorTexto,
                    $"No se encontró el proveedor '{proveedorTexto}'.");
                tieneError = true;
            }
        }

        // Validación Producto: Unidad de Medida
        var unidadMedidaId = 0;
        if (string.IsNullOrWhiteSpace(unidadTexto))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "UNIDAD_MEDIDA",
                unidadTexto,
                "La unidad de medida es obligatoria.");
            tieneError = true;
        }
        else if (!unidadesMap.TryGetValue(unidadTexto.ToUpperInvariant(), out unidadMedidaId))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "UNIDAD_MEDIDA",
                unidadTexto,
                $"No se encontró la unidad de medida '{unidadTexto}'.");
            tieneError = true;
        }

        // Parsing Precio de Venta
        decimal precioVenta = 0;
        if (!string.IsNullOrWhiteSpace(precioVentaTexto))
        {
            if (!decimal.TryParse(precioVentaTexto, NumberStyles.Number, CultureInfo.InvariantCulture, out precioVenta) &&
                !decimal.TryParse(precioVentaTexto, NumberStyles.Number, CultureInfo.CurrentCulture, out precioVenta))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "PRECIO_VENTA",
                    precioVentaTexto,
                    "El precio de venta debe ser un número válido.");
                tieneError = true;
            }
            else if (precioVenta < 0)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "PRECIO_VENTA",
                    precioVentaTexto,
                    "El precio de venta no puede ser negativo.");
                tieneError = true;
            }
        }

        // Parsing Booleans
        var controlaVencimiento = ParsearBooleano(controlaVencimientoTexto);

        // Parsing Stock Mínimo
        decimal stockMinimo = 0;
        if (!string.IsNullOrWhiteSpace(stockMinimoTexto))
        {
            if (!decimal.TryParse(stockMinimoTexto, NumberStyles.Number, CultureInfo.InvariantCulture, out stockMinimo) &&
                !decimal.TryParse(stockMinimoTexto, NumberStyles.Number, CultureInfo.CurrentCulture, out stockMinimo))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "STOCK_MINIMO",
                    stockMinimoTexto,
                    "El stock mínimo debe ser un número válido.");
                tieneError = true;
            }
            else if (stockMinimo < 0)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "STOCK_MINIMO",
                    stockMinimoTexto,
                    "El stock mínimo no puede ser negativo.");
                tieneError = true;
            }
        }

        // Parsing Stock Máximo
        decimal? stockMaximo = null;
        if (!string.IsNullOrWhiteSpace(stockMaximoTexto))
        {
            if (!decimal.TryParse(stockMaximoTexto, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsedMax) &&
                !decimal.TryParse(stockMaximoTexto, NumberStyles.Number, CultureInfo.CurrentCulture, out parsedMax))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "STOCK_MAXIMO",
                    stockMaximoTexto,
                    "El stock máximo debe ser un número válido.");
                tieneError = true;
            }
            else if (parsedMax < 0)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "STOCK_MAXIMO",
                    stockMaximoTexto,
                    "El stock máximo no puede ser negativo.");
                tieneError = true;
            }
            else if (parsedMax < stockMinimo)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "STOCK_MAXIMO",
                    stockMaximoTexto,
                    "El stock máximo no puede ser menor que el stock mínimo.");
                tieneError = true;
            }
            else
            {
                stockMaximo = parsedMax;
            }
        }

        // Validación Partida de Inventario: Número de Partida (Opcional, max 50)
        if (numeroPartida?.Length > 50)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NUMERO_PARTIDA",
                numeroPartida,
                "El número de partida no puede exceder los 50 caracteres.");
            tieneError = true;
        }

        // Parsing Fecha de Vencimiento de Partida
        DateOnly? fechaVencimiento = null;
        if (!string.IsNullOrWhiteSpace(fechaVencimientoTexto))
        {
            if (!TryParseFecha(fechaVencimientoTexto, out fechaVencimiento))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "FECHA_VENCIMIENTO",
                    fechaVencimientoTexto,
                    "La fecha de vencimiento no tiene un formato válido (ej: yyyy-MM-dd, dd/MM/yyyy).");
                tieneError = true;
            }
        }

        // Parsing Costo Unitario de Partida
        decimal? costoUnitario = null;
        if (!string.IsNullOrWhiteSpace(costoUnitarioTexto))
        {
            if (!decimal.TryParse(costoUnitarioTexto, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsedCosto) &&
                !decimal.TryParse(costoUnitarioTexto, NumberStyles.Number, CultureInfo.CurrentCulture, out parsedCosto))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "COSTO_UNITARIO",
                    costoUnitarioTexto,
                    "El costo unitario debe ser un número válido.");
                tieneError = true;
            }
            else if (parsedCosto < 0)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "COSTO_UNITARIO",
                    costoUnitarioTexto,
                    "El costo unitario no puede ser negativo.");
                tieneError = true;
            }
            else
            {
                costoUnitario = parsedCosto;
            }
        }

        var tieneDatosPartida = !string.IsNullOrWhiteSpace(numeroPartida) ||
                                fechaVencimiento.HasValue ||
                                costoUnitario.HasValue;

        if (controlaVencimiento && tieneDatosPartida && fechaVencimiento is null)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "FECHA_VENCIMIENTO",
                fechaVencimientoTexto,
                "La fecha de vencimiento es obligatoria cuando el producto controla vencimiento y se registra una partida.");
            tieneError = true;
        }

        // Parsing Almacén y Cantidad (Existencia y ExistenciaPartida)
        int? almacenId = null;
        if (!string.IsNullOrWhiteSpace(almacenTexto))
        {
            if (almacenesMap.TryGetValue(almacenTexto.ToUpperInvariant(), out var aId))
            {
                almacenId = aId;
            }
            else
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "ALMACEN",
                    almacenTexto,
                    $"No se encontró el almacén '{almacenTexto}'.");
                tieneError = true;
            }
        }

        decimal? cantidad = null;
        if (!string.IsNullOrWhiteSpace(cantidadTexto))
        {
            if (!decimal.TryParse(cantidadTexto, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsedCant) &&
                !decimal.TryParse(cantidadTexto, NumberStyles.Number, CultureInfo.CurrentCulture, out parsedCant))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CANTIDAD",
                    cantidadTexto,
                    "La cantidad debe ser un número válido.");
                tieneError = true;
            }
            else if (parsedCant < 0)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CANTIDAD",
                    cantidadTexto,
                    "La cantidad no puede ser negativa.");
                tieneError = true;
            }
            else
            {
                cantidad = parsedCant;
            }
        }

        if (cantidad.HasValue && cantidad.Value > 0 && !almacenId.HasValue)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "ALMACEN",
                null,
                "Debe especificar el almacén al ingresar una cantidad de stock.");
            tieneError = true;
        }

        if (tieneError || string.IsNullOrWhiteSpace(codigo))
            return;

        // Gestión del Producto (Nuevo vs Existente en memoria vs Existente en BD)
        ProductoEntity productoEntity;
        var productoYaEnBd = productosExistentesMap.TryGetValue(codigo, out var productoExistenteBd);
        var tieneOperacionAdicional = tieneDatosPartida || (almacenId.HasValue && cantidad.HasValue && cantidad.Value > 0);

        if (productoYaEnBd && productoExistenteBd != null)
        {
            productoEntity = productoExistenteBd;

            // Si el producto ya existe en BD y no viene partida ni stock para agregar, se cuenta como omitido
            if (!tieneOperacionAdicional)
            {
                resultado.Omitidos++;
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    "Ya existe un producto registrado con este código en la base de datos.");
                return;
            }
        }
        else if (productosNuevosMap.TryGetValue(codigo, out var productoExistenteEnMemoria))
        {
            // Producto ya registrado en una fila anterior del mismo Excel (para agregar múltiples partidas o existencias)
            productoEntity = productoExistenteEnMemoria;

            if (!tieneOperacionAdicional)
            {
                resultado.Omitidos++;
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    "El código del producto está repetido en el archivo Excel sin información de nueva partida o stock.");
                return;
            }
        }
        else
        {
            // Nuevo Producto
            productoEntity = new ProductoEntity
            {
                Codigo = codigo,
                Nombre = nombre!,
                Descripcion = descripcion,
                CategoriaProductoId = categoriaId,
                MarcaId = marcaId,
                ProveedorId = proveedorId,
                UnidadMedidaId = unidadMedidaId,
                ControlaVencimiento = controlaVencimiento,
                PrecioVenta = precioVenta,
                StockMinimo = stockMinimo,
                StockMaximo = stockMaximo,
                Activo = true
            };

            productosNuevosMap[codigo] = productoEntity;
        }

        // Gestión de la Partida de Inventario (si aplica)
        PartidaInventarioEntity? partidaEntity = null;
        int? partidaExistenteBdId = null;

        if (tieneDatosPartida)
        {
            if (!string.IsNullOrWhiteSpace(numeroPartida))
            {
                var clavePartidaExcel = $"{codigo}|{numeroPartida}";

                // Duplicado dentro del mismo archivo Excel
                if (!partidasProcesadasPorProducto.Add(clavePartidaExcel))
                {
                    AgregarError(
                        resultado,
                        fila.RowNumber,
                        "NUMERO_PARTIDA",
                        numeroPartida,
                        $"El número de partida '{numeroPartida}' está repetido para este producto en el archivo Excel.");
                    return;
                }

                // Ya existe en BD para este producto
                if (productoYaEnBd && productoExistenteBd != null)
                {
                    var clavePartidaDb = $"{productoExistenteBd.Id}|{numeroPartida}";
                    if (partidasExistentesDbMap.TryGetValue(clavePartidaDb, out var pIdDb))
                    {
                        partidaExistenteBdId = pIdDb;
                    }
                }
            }

            if (!partidaExistenteBdId.HasValue)
            {
                partidaEntity = new PartidaInventarioEntity
                {
                    NumeroPartida = numeroPartida,
                    FechaVencimiento = fechaVencimiento,
                    CostoUnitario = costoUnitario ?? 0,
                    Activo = true
                };

                if (productoYaEnBd && productoExistenteBd != null)
                {
                    partidaEntity.ProductoId = productoExistenteBd.Id;
                }
                else
                {
                    partidaEntity.Producto = productoEntity;
                }

                partidasNuevas.Add(partidaEntity);
            }
        }

        // Gestión de Existencia (Almacén + Producto) y ExistenciaPartida (Existencia + Partida)
        if (almacenId.HasValue && cantidad.HasValue && cantidad.Value > 0)
        {
            ExistenciaEntity existenciaEntity;
            var claveExistenciaMemoria = $"{almacenId.Value}|{codigo}";

            if (productoYaEnBd && existenciasDbMap.TryGetValue($"{almacenId.Value}|{productoExistenteBd!.Id}", out var existenciaDb))
            {
                existenciaEntity = existenciaDb;

                // Actualizar costo promedio ponderado si viene costo unitario
                if (costoUnitario.HasValue && costoUnitario.Value > 0)
                {
                    var stockPrevio = existenciaDb.Cantidad;
                    var costoPrevio = existenciaDb.CostoPromedio;
                    var valorPrevio = stockPrevio > 0 ? stockPrevio * costoPrevio : 0;
                    var valorEntrada = cantidad.Value * costoUnitario.Value;
                    var totalCantidad = stockPrevio + cantidad.Value;

                    existenciaDb.CostoPromedio = totalCantidad > 0
                        ? Math.Round((valorPrevio + valorEntrada) / totalCantidad, 4)
                        : costoUnitario.Value;
                }

                existenciaDb.Cantidad += cantidad.Value;
            }
            else if (existenciasNuevasMap.TryGetValue(claveExistenciaMemoria, out var existenciaMemoria))
            {
                existenciaEntity = existenciaMemoria;

                if (costoUnitario.HasValue && costoUnitario.Value > 0)
                {
                    var stockPrevio = existenciaMemoria.Cantidad;
                    var costoPrevio = existenciaMemoria.CostoPromedio;
                    var valorPrevio = stockPrevio > 0 ? stockPrevio * costoPrevio : 0;
                    var valorEntrada = cantidad.Value * costoUnitario.Value;
                    var totalCantidad = stockPrevio + cantidad.Value;

                    existenciaMemoria.CostoPromedio = totalCantidad > 0
                        ? Math.Round((valorPrevio + valorEntrada) / totalCantidad, 4)
                        : costoUnitario.Value;
                }

                existenciaMemoria.Cantidad += cantidad.Value;
            }
            else
            {
                existenciaEntity = new ExistenciaEntity
                {
                    AlmacenId = almacenId.Value,
                    Cantidad = cantidad.Value,
                    CantidadReservada = 0,
                    CostoPromedio = costoUnitario.GetValueOrDefault(0),
                    Activo = true
                };

                if (productoYaEnBd && productoExistenteBd != null)
                {
                    existenciaEntity.ProductoId = productoExistenteBd.Id;
                }
                else
                {
                    existenciaEntity.Producto = productoEntity;
                }

                existenciasNuevasMap[claveExistenciaMemoria] = existenciaEntity;
            }

            // Si hay partida (nueva o existente), asociarla mediante ExistenciaPartida
            if (partidaEntity != null || partidaExistenteBdId.HasValue)
            {
                if (existenciaEntity.Id > 0 && partidaExistenteBdId.HasValue &&
                    existenciasPartidasDbMap.TryGetValue($"{existenciaEntity.Id}|{partidaExistenteBdId.Value}", out var epExistente))
                {
                    epExistente.Cantidad += cantidad.Value;
                }
                else
                {
                    var ep = new ExistenciaPartidaEntity
                    {
                        Cantidad = cantidad.Value,
                        CantidadReservada = 0,
                        Activo = true
                    };

                    if (existenciaEntity.Id > 0)
                    {
                        ep.ExistenciaId = existenciaEntity.Id;
                    }
                    else
                    {
                        ep.Existencia = existenciaEntity;
                    }

                    if (partidaExistenteBdId.HasValue)
                    {
                        ep.PartidaInventarioId = partidaExistenteBdId.Value;
                    }
                    else
                    {
                        ep.PartidaInventario = partidaEntity!;
                    }

                    existenciasPartidasNuevas.Add(ep);
                }
            }
        }
    }

    private static void RegistrarVariaciones(Dictionary<string, int> map, string? valor, int id)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return;

        var limpio = valor.Trim().ToUpperInvariant();
        map[limpio] = id;
        map[limpio.Replace("_", " ")] = id;
        map[limpio.Replace(".", "")] = id;
        map[limpio.Replace(" ", "")] = id;
        map[limpio.Replace(".", " ").Replace("  ", " ").Trim()] = id;
    }

    private static Dictionary<string, int> ConstruirCategoriasMap(List<CategoriaProductoEntity> categorias)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var cat in categorias)
        {
            RegistrarVariaciones(map, cat.Codigo, cat.Id);
            RegistrarVariaciones(map, cat.Nombre, cat.Id);
        }

        return map;
    }

    private static Dictionary<string, int> ConstruirMarcasMap(List<MarcaEntity> marcas)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var m in marcas)
        {
            RegistrarVariaciones(map, m.Codigo, m.Id);
            RegistrarVariaciones(map, m.Nombre, m.Id);
        }

        return map;
    }

    private static Dictionary<string, int> ConstruirProveedoresMap(List<ProveedorEntity> proveedores)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var p in proveedores)
        {
            RegistrarVariaciones(map, p.Codigo, p.Id);
            RegistrarVariaciones(map, p.RazonSocial, p.Id);
            RegistrarVariaciones(map, p.NombreComercial, p.Id);
            RegistrarVariaciones(map, p.Nit, p.Id);
        }

        return map;
    }

    private static Dictionary<string, int> ConstruirUnidadesMap(List<UnidadesMedidaEntity> unidades)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var u in unidades)
        {
            RegistrarVariaciones(map, u.Codigo, u.Id);
            RegistrarVariaciones(map, u.Simbolo, u.Id);
            RegistrarVariaciones(map, u.Nombre, u.Id);
        }

        return map;
    }

    private static Dictionary<string, int> ConstruirAlmacenesMap(List<AlmacenEntity> almacenes)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var a in almacenes)
        {
            RegistrarVariaciones(map, a.Codigo, a.Id);
            RegistrarVariaciones(map, a.Nombre, a.Id);
        }

        return map;
    }

    private static void ValidarColumnas(List<ExcelRow> filas, ExcelImportResult resultado)
    {
        if (filas.Count == 0)
            return;

        var primeraFila = filas[0];

        string[] columnasObligatorias =
        [
            "CODIGO",
            "NOMBRE",
            "CATEGORIA",
            "UNIDAD_MEDIDA"
        ];

        foreach (var columna in columnasObligatorias)
        {
            if (primeraFila.Values.ContainsKey(columna))
            {
                continue;
            }

            resultado.Errors.Add(
                new ExcelImportError
                {
                    Row = 1,
                    Column = columna,
                    Value = null,
                    Message = $"No se encontró la columna obligatoria '{columna}' en el Excel."
                });
        }
    }

    private static string? NormalizarCodigo(string? codigo)
    {
        if (string.IsNullOrWhiteSpace(codigo))
            return null;

        return codigo.Trim().ToUpperInvariant();
    }

    private static string? NormalizarNumeroPartida(string? numeroPartida)
    {
        if (string.IsNullOrWhiteSpace(numeroPartida))
            return null;

        return numeroPartida.Trim().ToUpperInvariant();
    }

    private static string? NormalizarTexto(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        return valor.Trim();
    }

    private static bool ParsearBooleano(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var normalizado = valor.Trim().ToUpperInvariant();
        return normalizado is "SI" or "S" or "TRUE" or "1" or "VERDADERO" or "YES" or "Y";
    }

    private static bool TryParseFecha(string valor, out DateOnly? fecha)
    {
        fecha = null;

        string[] formatos =
        [
            "yyyy-MM-dd",
            "dd/MM/yyyy",
            "dd-MM-yyyy",
            "d/M/yyyy",
            "d-M-yyyy",
            "yyyy/MM/dd",
            "MM/dd/yyyy"
        ];

        foreach (var formato in formatos)
        {
            if (DateOnly.TryParseExact(
                    valor,
                    formato,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var fechaResultado))
            {
                fecha = fechaResultado;
                return true;
            }
        }

        if (DateOnly.TryParse(valor, out var fechaGenerica))
        {
            fecha = fechaGenerica;
            return true;
        }

        return false;
    }

    private static void AgregarError(
        ExcelImportResult resultado,
        int fila,
        string columna,
        string? valor,
        string mensaje)
    {
        resultado.Errors.Add(
            new ExcelImportError
            {
                Row = fila,
                Column = columna,
                Value = valor,
                Message = mensaje
            });
    }
}
