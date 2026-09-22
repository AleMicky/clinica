using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Entity;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using CargoEntity = Clinica.Api.Modules.RecursosHumanos.Cargo.Entity.Cargo;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Services;

public interface ICargoImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}

public sealed class CargoImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : ICargoImportacionService
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

        // Extraer códigos válidos del archivo Excel
        var codigosExcel = filas
            .Select(x => NormalizarCodigo(x.Get("CODIGO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Obtener códigos que ya existen en la base de datos
        var codigosExistentes = await dbContext.Cargos
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .Select(x => x.Codigo)
            .ToListAsync(cancellationToken);

        var codigosExistentesSet = codigosExistentes.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var codigosProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var cargosNuevos = new List<CargoEntity>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                cargosNuevos,
                codigosExistentesSet,
                codigosProcesados,
                resultado);
        }

        if (cargosNuevos.Count == 0)
            return resultado;

        await dbContext.Cargos.AddRangeAsync(cargosNuevos, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = cargosNuevos.Count;
        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        List<CargoEntity> cargosNuevos,
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
                "El código del cargo es obligatorio.");
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
            // Duplicado dentro del mismo archivo Excel
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

            // Ya existe registrado en la BD
            if (codigosExistentes.Contains(codigo))
            {
                resultado.Omitidos++;
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "CODIGO",
                    codigo,
                    $"Ya existe un cargo registrado con el código '{codigo}'.");
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
                "El nombre del cargo es obligatorio.");
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

        cargosNuevos.Add(new CargoEntity
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
