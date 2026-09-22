using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Area.Entity;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;
using TipoAreaEntity = Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity.TipoArea;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Services;

public interface IAreaImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}

public sealed class AreaImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IAreaImportacionService
{
    public async Task<ExcelImportResult> ImportarAsync(Stream archivo, CancellationToken cancellationToken = default)
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

        // Precargar catálogo de Tipos de Área activos (por Código y por Nombre)
        var tiposAreaActivos = await dbContext.TiposArea
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var tiposPorCodigo = tiposAreaActivos
            .Where(x => !string.IsNullOrWhiteSpace(x.Codigo))
            .ToDictionary(x => x.Codigo.Trim().ToUpperInvariant(), x => x.Id, StringComparer.OrdinalIgnoreCase);

        var tiposPorNombre = tiposAreaActivos
            .ToDictionary(x => x.Nombre.Trim().ToUpperInvariant(), x => x.Id, StringComparer.OrdinalIgnoreCase);

        // Precargar catálogo de Áreas activas (por Código y por Id)
        var areasExistentes = await dbContext.Areas
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // Mapeo (TipoAreaId, Codigo) -> Id
        var codigosExistentesSet = areasExistentes
            .Select(x => $"{x.TipoAreaId}:{x.Codigo.Trim().ToUpperInvariant()}")
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Mapeo por Código general para resolver AreaPadre
        var areasPorCodigo = areasExistentes
            .Where(x => !string.IsNullOrWhiteSpace(x.Codigo))
            .GroupBy(x => x.Codigo.Trim().ToUpperInvariant(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        var areasPorNombre = areasExistentes
            .GroupBy(x => x.Nombre.Trim().ToUpperInvariant(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        var codigosProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var areasNuevas = new List<AreaEntity>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                areasNuevas,
                tiposPorCodigo,
                tiposPorNombre,
                areasPorCodigo,
                areasPorNombre,
                codigosExistentesSet,
                codigosProcesados,
                resultado);
        }

        if (areasNuevas.Count == 0)
            return resultado;

        await dbContext.Areas.AddRangeAsync(areasNuevas, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = areasNuevas.Count;
        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        List<AreaEntity> areasNuevas,
        Dictionary<string, int> tiposPorCodigo,
        Dictionary<string, int> tiposPorNombre,
        Dictionary<string, int> areasPorCodigo,
        Dictionary<string, int> areasPorNombre,
        HashSet<string> codigosExistentesSet,
        HashSet<string> codigosProcesados,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        var tipoAreaValor = NormalizarTexto(fila.Get("TIPO_AREA") ?? fila.Get("CODIGO_TIPO_AREA"));
        var codigo = NormalizarCodigo(fila.Get("CODIGO"));
        var nombre = NormalizarTexto(fila.Get("NOMBRE"));
        var descripcion = NormalizarTexto(fila.Get("DESCRIPCION"));
        var areaPadreValor = NormalizarTexto(fila.Get("AREA_PADRE") ?? fila.Get("CODIGO_AREA_PADRE"));
        var ordenValor = NormalizarTexto(fila.Get("ORDEN"));

        // 1. Validar Tipo de Área
        var tipoAreaId = 0;
        if (string.IsNullOrWhiteSpace(tipoAreaValor))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "TIPO_AREA",
                tipoAreaValor,
                "El tipo de área es obligatorio.");
            tieneError = true;
        }
        else
        {
            var tipoAreaNorm = tipoAreaValor.ToUpperInvariant();
            if (tiposPorCodigo.TryGetValue(tipoAreaNorm, out var idPorCod))
            {
                tipoAreaId = idPorCod;
            }
            else if (tiposPorNombre.TryGetValue(tipoAreaNorm, out var idPorNom))
            {
                tipoAreaId = idPorNom;
            }
            else if (int.TryParse(tipoAreaValor, out var parsedId) && tiposPorCodigo.Values.Contains(parsedId))
            {
                tipoAreaId = parsedId;
            }
            else
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "TIPO_AREA",
                    tipoAreaValor,
                    $"No se encontró el tipo de área '{tipoAreaValor}' especificado.");
                tieneError = true;
            }
        }

        // 2. Validar CODIGO
        if (string.IsNullOrWhiteSpace(codigo))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código del área es obligatorio.");
            tieneError = true;
        }
        else if (codigo.Length > 20)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código no puede superar los 20 caracteres.");
            tieneError = true;
        }
        else if (tipoAreaId > 0)
        {
            var keyCompuesta = $"{tipoAreaId}:{codigo}";

            // Duplicado dentro del mismo archivo
            if (!codigosProcesados.Add(keyCompuesta))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    $"El código '{codigo}' para el tipo de área seleccionado está repetido dentro del archivo Excel.");
                tieneError = true;
            }

            // Ya existente en BD
            if (codigosExistentesSet.Contains(keyCompuesta))
            {
                resultado.Omitidos++;
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    $"Ya existe un área con el código '{codigo}' registrada para este tipo de área.");
                tieneError = true;
            }
        }

        // 3. Validar NOMBRE
        if (string.IsNullOrWhiteSpace(nombre))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE",
                nombre,
                "El nombre del área es obligatorio.");
            tieneError = true;
        }
        else if (nombre.Length > 100)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE",
                nombre,
                "El nombre no puede superar los 100 caracteres.");
            tieneError = true;
        }

        // 4. Validar DESCRIPCION (opcional)
        if (!string.IsNullOrWhiteSpace(descripcion) && descripcion.Length > 250)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "DESCRIPCION",
                descripcion,
                "La descripción no puede superar los 250 caracteres.");
            tieneError = true;
        }

        // 5. Validar AREA_PADRE (opcional)
        int? areaPadreId = null;
        if (!string.IsNullOrWhiteSpace(areaPadreValor))
        {
            var padreNorm = areaPadreValor.ToUpperInvariant();
            if (areasPorCodigo.TryGetValue(padreNorm, out var idPadrePorCod))
            {
                areaPadreId = idPadrePorCod;
            }
            else if (areasPorNombre.TryGetValue(padreNorm, out var idPadrePorNom))
            {
                areaPadreId = idPadrePorNom;
            }
            else if (int.TryParse(areaPadreValor, out var parsedPadreId) && areasPorCodigo.Values.Contains(parsedPadreId))
            {
                areaPadreId = parsedPadreId;
            }
            else
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "AREA_PADRE",
                    areaPadreValor,
                    $"No se encontró el área padre '{areaPadreValor}' en el sistema.");
                tieneError = true;
            }
        }

        // 6. Validar ORDEN (opcional)
        var orden = 0;
        if (!string.IsNullOrWhiteSpace(ordenValor))
        {
            if (int.TryParse(ordenValor, out var parsedOrden))
            {
                orden = parsedOrden;
            }
            else
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "ORDEN",
                    ordenValor,
                    "El campo orden debe ser un número entero válido.");
                tieneError = true;
            }
        }

        if (tieneError)
            return;

        var nuevaArea = new AreaEntity
        {
            Codigo = codigo!,
            Nombre = nombre!,
            Descripcion = descripcion,
            TipoAreaId = tipoAreaId,
            AreaPadreId = areaPadreId,
            Orden = orden,
            Activo = true
        };

        areasNuevas.Add(nuevaArea);
    }

    private static void ValidarColumnas(List<ExcelRow> filas, ExcelImportResult resultado)
    {
        if (filas.Count == 0)
            return;

        var primeraFila = filas[0];

        var tieneTipoArea = primeraFila.Values.ContainsKey("TIPO_AREA") || primeraFila.Values.ContainsKey("CODIGO_TIPO_AREA");
        var tieneCodigo = primeraFila.Values.ContainsKey("CODIGO");
        var tieneNombre = primeraFila.Values.ContainsKey("NOMBRE");

        if (!tieneTipoArea)
        {
            resultado.Errors.Add(new ExcelImportError
            {
                Row = 1,
                Column = "TIPO_AREA",
                Value = null,
                Message = "No se encontró la columna obligatoria 'TIPO_AREA' (o 'CODIGO_TIPO_AREA') en el archivo Excel."
            });
        }

        if (!tieneCodigo)
        {
            resultado.Errors.Add(new ExcelImportError
            {
                Row = 1,
                Column = "CODIGO",
                Value = null,
                Message = "No se encontró la columna obligatoria 'CODIGO' en el archivo Excel."
            });
        }

        if (!tieneNombre)
        {
            resultado.Errors.Add(new ExcelImportError
            {
                Row = 1,
                Column = "NOMBRE",
                Value = null,
                Message = "No se encontró la columna obligatoria 'NOMBRE' en el archivo Excel."
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

    private static void AgregarError(
        ExcelImportResult resultado,
        int fila,
        string columna,
        string? valor,
        string mensaje)
    {
        resultado.Errors.Add(new ExcelImportError
        {
            Row = fila,
            Column = columna,
            Value = valor,
            Message = mensaje
        });
    }
}
