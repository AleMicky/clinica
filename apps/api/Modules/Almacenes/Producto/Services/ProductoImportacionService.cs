using System.Globalization;
using Clinica.Api.Data;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
using MarcaEntity = Clinica.Api.Modules.Almacenes.Marca.Entity.Marca;
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

        // 3. Consultar productos existentes en BD
        var productosExistentesDb = await dbContext.Productos
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .ToListAsync(cancellationToken);

        var productosExistentesMap = productosExistentesDb
            .ToDictionary(x => x.Codigo, x => x, StringComparer.OrdinalIgnoreCase);

        // 4. Estructuras para seguimiento en memoria durante el procesamiento
        var productosNuevosMap = new Dictionary<string, ProductoEntity>(StringComparer.OrdinalIgnoreCase);

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                productosNuevosMap,
                categoriasMap,
                marcasMap,
                proveedoresMap,
                unidadesMap,
                productosExistentesMap,
                resultado);
        }

        if (productosNuevosMap.Count == 0)
            return resultado;

        // 5. Persistir entidades
        await dbContext.Productos.AddRangeAsync(productosNuevosMap.Values, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = productosNuevosMap.Count;

        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        Dictionary<string, ProductoEntity> productosNuevosMap,
        Dictionary<string, int> categoriasMap,
        Dictionary<string, int> marcasMap,
        Dictionary<string, int> proveedoresMap,
        Dictionary<string, int> unidadesMap,
        Dictionary<string, ProductoEntity> productosExistentesMap,
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
        var controlaVencimientoTexto = NormalizarTexto(fila.Get("CONTROLA_VENCIMIENTO"));
        var stockMinimoTexto = NormalizarTexto(fila.Get("STOCK_MINIMO"));
        var stockMaximoTexto = NormalizarTexto(fila.Get("STOCK_MAXIMO"));

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

        if (tieneError || string.IsNullOrWhiteSpace(codigo))
            return;

        // Gestión del Producto (Nuevo vs Existente en BD vs Duplicado en Excel)
        if (productosExistentesMap.ContainsKey(codigo))
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

        if (productosNuevosMap.ContainsKey(codigo))
        {
            resultado.Omitidos++;
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código del producto está repetido en el archivo Excel.");
            return;
        }

        // Nuevo Producto
        var productoEntity = new ProductoEntity
        {
            Codigo = codigo,
            Nombre = nombre!,
            Descripcion = descripcion,
            CategoriaProductoId = categoriaId,
            MarcaId = marcaId,
            ProveedorId = proveedorId,
            UnidadMedidaId = unidadMedidaId,
            ControlaVencimiento = controlaVencimiento,
            StockMinimo = stockMinimo,
            StockMaximo = stockMaximo,
            Activo = true
        };

        productosNuevosMap[codigo] = productoEntity;
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
