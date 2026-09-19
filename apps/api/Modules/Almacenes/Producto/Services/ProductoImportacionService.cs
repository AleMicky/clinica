using System.Globalization;
using Clinica.Api.Data;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
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

        var unidadesMedida = await dbContext.UnidadesMedida
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var categoriasMap = ConstruirCategoriasMap(categorias);
        var unidadesMap = ConstruirUnidadesMap(unidadesMedida);

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

        // 4. Consultar lotes existentes en BD para los productos existentes
        var productosExistentesIds = productosExistentesDb.Select(x => x.Id).ToList();
        var lotesExistentesDb = await dbContext.Lotes
            .AsNoTracking()
            .Where(x => productosExistentesIds.Contains(x.ProductoId))
            .Select(x => new { x.ProductoId, x.NumeroLote })
            .ToListAsync(cancellationToken);

        var lotesExistentesDbSet = lotesExistentesDb
            .Select(x => $"{x.ProductoId}|{x.NumeroLote.ToUpperInvariant()}")
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // 5. Estructuras para seguimiento en memoria durante el procesamiento
        var productosNuevosMap = new Dictionary<string, ProductoEntity>(StringComparer.OrdinalIgnoreCase);
        var lotesNuevos = new List<LoteEntity>();
        var lotesProcesadosPorProducto = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                productosNuevosMap,
                lotesNuevos,
                categoriasMap,
                unidadesMap,
                productosExistentesMap,
                lotesExistentesDbSet,
                lotesProcesadosPorProducto,
                resultado);
        }

        if (productosNuevosMap.Count == 0 && lotesNuevos.Count == 0)
            return resultado;

        // 6. Persistir entidades
        if (productosNuevosMap.Count > 0)
        {
            await dbContext.Productos.AddRangeAsync(productosNuevosMap.Values, cancellationToken);
        }

        if (lotesNuevos.Count > 0)
        {
            await dbContext.Lotes.AddRangeAsync(lotesNuevos, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = productosNuevosMap.Count;

        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        Dictionary<string, ProductoEntity> productosNuevosMap,
        List<LoteEntity> lotesNuevos,
        Dictionary<string, int> categoriasMap,
        Dictionary<string, int> unidadesMap,
        Dictionary<string, ProductoEntity> productosExistentesMap,
        HashSet<string> lotesExistentesDbSet,
        HashSet<string> lotesProcesadosPorProducto,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        // Lectura de campos de Producto
        var codigo = NormalizarCodigo(fila.Get("CODIGO"));
        var nombre = NormalizarTexto(fila.Get("NOMBRE"));
        var descripcion = NormalizarTexto(fila.Get("DESCRIPCION"));
        var categoriaTexto = NormalizarTexto(fila.Get("CATEGORIA"));
        var unidadTexto = NormalizarTexto(fila.Get("UNIDAD_MEDIDA"));
        var controlaLoteTexto = NormalizarTexto(fila.Get("CONTROLA_LOTE"));
        var controlaVencimientoTexto = NormalizarTexto(fila.Get("CONTROLA_VENCIMIENTO"));
        var stockMinimoTexto = NormalizarTexto(fila.Get("STOCK_MINIMO"));
        var stockMaximoTexto = NormalizarTexto(fila.Get("STOCK_MAXIMO"));

        // Lectura de campos de Lote
        var numeroLote = NormalizarNumeroLote(fila.Get("NUMERO_LOTE"));
        var fechaFabricacionTexto = NormalizarTexto(fila.Get("FECHA_FABRICACION"));
        var fechaVencimientoTexto = NormalizarTexto(fila.Get("FECHA_VENCIMIENTO"));
        var costoUnitarioTexto = NormalizarTexto(fila.Get("COSTO_UNITARIO"));

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

        // Parsing Booleans
        var controlaLote = ParsearBooleano(controlaLoteTexto);
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

        // Parsing Fechas Lote
        DateOnly? fechaFabricacion = null;
        if (!string.IsNullOrWhiteSpace(fechaFabricacionTexto))
        {
            if (!TryParseFecha(fechaFabricacionTexto, out fechaFabricacion))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "FECHA_FABRICACION",
                    fechaFabricacionTexto,
                    "La fecha de fabricación no tiene un formato válido (ej: yyyy-MM-dd, dd/MM/yyyy).");
                tieneError = true;
            }
            else if (fechaFabricacion > DateOnly.FromDateTime(DateTime.Today))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "FECHA_FABRICACION",
                    fechaFabricacionTexto,
                    "La fecha de fabricación no puede ser futura.");
                tieneError = true;
            }
        }

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

        if (controlaVencimiento && !string.IsNullOrWhiteSpace(numeroLote) && fechaVencimiento is null)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "FECHA_VENCIMIENTO",
                fechaVencimientoTexto,
                "La fecha de vencimiento es obligatoria cuando el producto controla vencimiento.");
            tieneError = true;
        }

        if (fechaFabricacion.HasValue && fechaVencimiento.HasValue && fechaVencimiento < fechaFabricacion)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "FECHA_VENCIMIENTO",
                fechaVencimientoTexto,
                "La fecha de vencimiento no puede ser anterior a la fecha de fabricación.");
            tieneError = true;
        }

        // Parsing Costo Unitario
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

        if (tieneError || string.IsNullOrWhiteSpace(codigo))
            return;

        // Gestión del Producto (Nuevo vs Existente en memoria vs Existente en BD)
        ProductoEntity productoEntity;
        var productoYaEnBd = productosExistentesMap.TryGetValue(codigo, out var productoExistenteBd);

        if (productoYaEnBd && productoExistenteBd != null)
        {
            productoEntity = productoExistenteBd;

            // Si el producto ya existe en BD y no viene lote para agregar, se cuenta como omitido
            if (string.IsNullOrWhiteSpace(numeroLote))
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
            // Producto ya registrado en una fila anterior del mismo Excel (ej. para agregar múltiples lotes)
            productoEntity = productoExistenteEnMemoria;
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
                UnidadMedidaId = unidadMedidaId,
                ControlaLote = controlaLote,
                ControlaVencimiento = controlaVencimiento,
                StockMinimo = stockMinimo,
                StockMaximo = stockMaximo,
                Activo = true
            };

            productosNuevosMap[codigo] = productoEntity;
        }

        // Gestión del Lote (si aplica)
        if (!string.IsNullOrWhiteSpace(numeroLote))
        {
            var claveLoteExcel = $"{codigo}|{numeroLote}";

            // Duplicado dentro del mismo archivo Excel
            if (!lotesProcesadosPorProducto.Add(claveLoteExcel))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "NUMERO_LOTE",
                    numeroLote,
                    $"El número de lote '{numeroLote}' está repetido para este producto en el archivo Excel.");
                return;
            }

            // Ya existe en BD para este producto
            if (productoYaEnBd && productoExistenteBd != null)
            {
                var claveLoteDb = $"{productoExistenteBd.Id}|{numeroLote}";
                if (lotesExistentesDbSet.Contains(claveLoteDb))
                {
                    AgregarError(
                        resultado,
                        fila.RowNumber,
                        "NUMERO_LOTE",
                        numeroLote,
                        $"Ya existe un lote '{numeroLote}' registrado para este producto en la base de datos.");
                    return;
                }
            }

            var lote = new LoteEntity
            {
                NumeroLote = numeroLote,
                FechaFabricacion = fechaFabricacion,
                FechaVencimiento = fechaVencimiento,
                CostoUnitario = costoUnitario,
                Activo = true
            };

            if (productoYaEnBd && productoExistenteBd != null)
            {
                lote.ProductoId = productoExistenteBd.Id;
            }
            else
            {
                lote.Producto = productoEntity;
            }

            lotesNuevos.Add(lote);
        }
        else if (productoEntity.ControlaLote)
        {
            // Si el producto controla lote pero no se especificó un lote en la fila
            // Se puede permitir la creación del producto sin lote inicial (quedará sin existencias)
        }
    }

    private static Dictionary<string, int> ConstruirCategoriasMap(List<CategoriaProductoEntity> categorias)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var cat in categorias)
        {
            if (!string.IsNullOrWhiteSpace(cat.Codigo))
                map[cat.Codigo.Trim().ToUpperInvariant()] = cat.Id;

            if (!string.IsNullOrWhiteSpace(cat.Nombre))
                map[cat.Nombre.Trim().ToUpperInvariant()] = cat.Id;
        }

        return map;
    }

    private static Dictionary<string, int> ConstruirUnidadesMap(List<UnidadesMedidaEntity> unidades)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var u in unidades)
        {
            if (!string.IsNullOrWhiteSpace(u.Codigo))
                map[u.Codigo.Trim().ToUpperInvariant()] = u.Id;

            if (!string.IsNullOrWhiteSpace(u.Simbolo))
                map[u.Simbolo.Trim().ToUpperInvariant()] = u.Id;

            if (!string.IsNullOrWhiteSpace(u.Nombre))
                map[u.Nombre.Trim().ToUpperInvariant()] = u.Id;
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

    private static string? NormalizarNumeroLote(string? numeroLote)
    {
        if (string.IsNullOrWhiteSpace(numeroLote))
            return null;

        return numeroLote.Trim().ToUpperInvariant();
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
