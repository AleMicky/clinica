using System.Globalization;
using Clinica.Api.Data;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
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

        var categoriasMap = ConstruirCategoriasMap(categorias);
        var marcasMap = ConstruirMarcasMap(marcas);
        var proveedoresMap = ConstruirProveedoresMap(proveedores);
        var unidadesMap = ConstruirUnidadesMap(unidadesMedida);

        // 2. Extraer códigos de productos del Excel
        var codigosExcel = filas
            .Select(x => NormalizarCodigo(x.Get("CODIGO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 3. Consultar productos existentes en BD por código
        var productosExistentesDb = await dbContext.Productos
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .ToListAsync(cancellationToken);

        var productosExistentesMap = productosExistentesDb
            .ToDictionary(x => x.Codigo, x => x, StringComparer.OrdinalIgnoreCase);

        // 3.1 Consultar productos existentes en BD por combinación de atributos (Nombre, Marca, Unidad de Medida, Proveedor)
        // para prevenir duplicación de productos físicos bajo diferentes códigos
        var productosAtributosDb = await dbContext.Productos
            .AsNoTracking()
            .Where(x => x.Activo)
            .Select(x => new
            {
                x.Id,
                x.Codigo,
                x.Nombre,
                x.MarcaId,
                x.UnidadMedidaId,
                x.ProveedorId
            })
            .ToListAsync(cancellationToken);

        var productosPorAtributosDbMap = new Dictionary<string, (int Id, string Codigo)>(StringComparer.OrdinalIgnoreCase);
        foreach (var p in productosAtributosDb)
        {
            var clave = GenerarClaveAtributosProducto(p.Nombre, p.MarcaId, p.UnidadMedidaId, p.ProveedorId);
            productosPorAtributosDbMap.TryAdd(clave, (p.Id, p.Codigo));
        }

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

        // 5. Estructuras para seguimiento en memoria durante el procesamiento
        var productosNuevosMap = new Dictionary<string, ProductoEntity>(StringComparer.OrdinalIgnoreCase);
        var productosNuevosPorAtributosMap = new Dictionary<string, (int Fila, string Codigo)>(StringComparer.OrdinalIgnoreCase);
        var partidasNuevas = new List<PartidaInventarioEntity>();
        var partidasProcesadasPorProducto = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                productosNuevosMap,
                productosNuevosPorAtributosMap,
                partidasNuevas,
                categoriasMap,
                marcasMap,
                proveedoresMap,
                unidadesMap,
                productosExistentesMap,
                productosPorAtributosDbMap,
                partidasExistentesDbSet,
                partidasExistentesDbMap,
                partidasProcesadasPorProducto,
                resultado);
        }

        if (productosNuevosMap.Count == 0 &&
            partidasNuevas.Count == 0 &&
            !dbContext.ChangeTracker.HasChanges())
        {
            return resultado;
        }

        // 6. Persistir entidades
        if (productosNuevosMap.Count > 0)
        {
            await dbContext.Productos.AddRangeAsync(productosNuevosMap.Values, cancellationToken);
        }

        if (partidasNuevas.Count > 0)
        {
            await dbContext.PartidasInventario.AddRangeAsync(partidasNuevas, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = productosNuevosMap.Count > 0
            ? productosNuevosMap.Count
            : partidasNuevas.Count;

        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        Dictionary<string, ProductoEntity> productosNuevosMap,
        Dictionary<string, (int Fila, string Codigo)> productosNuevosPorAtributosMap,
        List<PartidaInventarioEntity> partidasNuevas,
        Dictionary<string, int> categoriasMap,
        Dictionary<string, int> marcasMap,
        Dictionary<string, int> proveedoresMap,
        Dictionary<string, int> unidadesMap,
        Dictionary<string, ProductoEntity> productosExistentesMap,
        Dictionary<string, (int Id, string Codigo)> productosPorAtributosDbMap,
        HashSet<string> partidasExistentesDbSet,
        Dictionary<string, int> partidasExistentesDbMap,
        HashSet<string> partidasProcesadasPorProducto,
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
            if (!TryParseDecimal(precioVentaTexto, out precioVenta))
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
            if (!TryParseDecimal(stockMinimoTexto, out stockMinimo))
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
            if (!TryParseDecimal(stockMaximoTexto, out var parsedMax))
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
            if (!TryParseDecimal(costoUnitarioTexto, out var parsedCosto))
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

        if (tieneError || string.IsNullOrWhiteSpace(codigo))
            return;

        // Gestión del Producto (Nuevo vs Existente en memoria vs Existente en BD)
        ProductoEntity productoEntity;
        var productoYaEnBd = productosExistentesMap.TryGetValue(codigo, out var productoExistenteBd);
        var tieneOperacionAdicional = tieneDatosPartida;

        // Validación de no duplicidad por (Nombre + Marca + Unidad de Medida + Proveedor)
        var claveAtributos = GenerarClaveAtributosProducto(nombre!, marcaId, unidadMedidaId, proveedorId);

        // 1. Validar contra productos activos existentes en Base de Datos
        if (productosPorAtributosDbMap.TryGetValue(claveAtributos, out var prodExistenteDb))
        {
            var esMismoProductoDb = productoYaEnBd && productoExistenteBd != null && prodExistenteDb.Id == productoExistenteBd.Id;
            if (!esMismoProductoDb)
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "NOMBRE",
                    nombre,
                    $"Ya existe un producto registrado en el sistema con el mismo nombre, marca, unidad de medida y proveedor (Código: '{prodExistenteDb.Codigo}').");
                return;
            }
        }

        // 2. Validar contra productos procesados previamente en el mismo archivo Excel
        if (productosNuevosPorAtributosMap.TryGetValue(claveAtributos, out var prodExcelPrevio) &&
            !string.Equals(prodExcelPrevio.Codigo, codigo, StringComparison.OrdinalIgnoreCase))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE",
                nombre,
                $"El producto tiene el mismo nombre, marca, unidad de medida y proveedor que el registrado en la fila {prodExcelPrevio.Fila} (Código: '{prodExcelPrevio.Codigo}').");
            return;
        }

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
            productosNuevosPorAtributosMap[claveAtributos] = (fila.RowNumber, codigo);
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

    private static string GenerarClaveAtributosProducto(
        string nombre,
        int? marcaId,
        int unidadMedidaId,
        int? proveedorId)
    {
        var nombreLimpio = NormalizarTexto(nombre) ?? string.Empty;
        var nombreNorm = string.Join(" ", nombreLimpio.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            .ToUpperInvariant();
        var marcaStr = marcaId.HasValue ? marcaId.Value.ToString() : "SIN_MARCA";
        var umStr = unidadMedidaId.ToString();
        var provStr = proveedorId.HasValue ? proveedorId.Value.ToString() : "SIN_PROVEEDOR";

        return $"{nombreNorm}|{marcaStr}|{umStr}|{provStr}";
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

    private static bool TryParseDecimal(string? valor, out decimal resultado)
    {
        resultado = 0;
        if (string.IsNullOrWhiteSpace(valor))
            return false;

        var clean = valor.Trim()
            .Replace("$", "")
            .Replace("Bs.", "")
            .Replace("Bs", "")
            .Replace("€", "")
            .Replace(" ", "");

        if (string.IsNullOrWhiteSpace(clean))
            return false;

        // Si contiene tanto punto como coma, determinar el separador decimal según la última posición
        if (clean.Contains('.') && clean.Contains(','))
        {
            var lastDot = clean.LastIndexOf('.');
            var lastComma = clean.LastIndexOf(',');

            if (lastDot > lastComma)
            {
                // Formato 1,234.56 -> eliminar comas (miles)
                clean = clean.Replace(",", "");
            }
            else
            {
                // Formato 1.234,56 -> eliminar puntos (miles) y cambiar coma por punto
                clean = clean.Replace(".", "").Replace(',', '.');
            }
        }
        else if (clean.Contains(','))
        {
            // Si contiene múltiples comas y ningún punto, son separadores de miles (ej: 1,000,000)
            if (clean.Count(c => c == ',') > 1)
            {
                clean = clean.Replace(",", "");
            }
            else
            {
                // Una sola coma representa el separador decimal (ej: 12,50 o 0,5)
                clean = clean.Replace(',', '.');
            }
        }
        else if (clean.Contains('.'))
        {
            // Si contiene múltiples puntos y ninguna coma, son separadores de miles (ej: 1.000.000)
            if (clean.Count(c => c == '.') > 1)
            {
                clean = clean.Replace(".", "");
            }
        }

        return decimal.TryParse(clean, NumberStyles.Number, CultureInfo.InvariantCulture, out resultado);
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
