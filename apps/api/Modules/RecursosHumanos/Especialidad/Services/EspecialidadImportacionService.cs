using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using EspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity.Especialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Services;

public interface IEspecialidadImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}

public sealed class EspecialidadImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IEspecialidadImportacionService
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

        // Extraer códigos normalizados del Excel
        var codigosExcel = filas
            .Select(x => NormalizarCodigo(x.Get("CODIGO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Obtener códigos existentes en BD
        var codigosExistentes = await dbContext.Especialidades
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .Select(x => x.Codigo)
            .ToListAsync(cancellationToken);

        var codigosExistentesSet = codigosExistentes.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var codigosProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var especialidadesNuevas = new List<EspecialidadEntity>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                especialidadesNuevas,
                codigosExistentesSet,
                codigosProcesados,
                resultado);
        }

        if (especialidadesNuevas.Count == 0)
            return resultado;

        await dbContext.Especialidades.AddRangeAsync(especialidadesNuevas, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = especialidadesNuevas.Count;
        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        List<EspecialidadEntity> especialidadesNuevas,
        HashSet<string> codigosExistentes,
        HashSet<string> codigosProcesados,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        var codigo = NormalizarCodigo(fila.Get("CODIGO"));
        var nombre = NormalizarTexto(fila.Get("NOMBRE"));
        var descripcion = NormalizarTexto(fila.Get("DESCRIPCION"));

        // Validar CODIGO
        if (string.IsNullOrWhiteSpace(codigo))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código de la especialidad es obligatorio.");
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
        else
        {
            // Duplicado en el mismo archivo
            if (!codigosProcesados.Add(codigo))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    "El código está repetido dentro del archivo Excel.");
                tieneError = true;
            }

            // Ya existe en BD
            if (codigosExistentes.Contains(codigo))
            {
                resultado.Omitidos++;
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    $"Ya existe una especialidad registrada con el código '{codigo}'.");
                tieneError = true;
            }
        }

        // Validar NOMBRE
        if (string.IsNullOrWhiteSpace(nombre))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRE",
                nombre,
                "El nombre de la especialidad es obligatorio.");
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

        // Validar DESCRIPCION (opcional)
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

        if (tieneError)
            return;

        especialidadesNuevas.Add(new EspecialidadEntity
        {
            Codigo = codigo!,
            Nombre = nombre!,
            Descripcion = descripcion,
            Activo = true
        });
    }

    private static void ValidarColumnas(List<ExcelRow> filas, ExcelImportResult resultado)
    {
        if (filas.Count == 0)
            return;

        var primeraFila = filas[0];

        string[] columnasObligatorias =
        [
            "CODIGO",
            "NOMBRE"
        ];

        foreach (var columna in columnasObligatorias)
        {
            if (primeraFila.Values.ContainsKey(columna))
                continue;

            resultado.Errors.Add(new ExcelImportError
            {
                Row = 1,
                Column = columna,
                Value = null,
                Message = $"No se encontró la columna obligatoria '{columna}' en el archivo Excel."
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
