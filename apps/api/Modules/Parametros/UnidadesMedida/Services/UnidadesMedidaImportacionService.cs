using Clinica.Api.Data;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using UnidadesMedidaEntity = Clinica.Api.Modules.Parametros.UnidadesMedida.Entity.UnidadesMedida;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Services;

public sealed class UnidadesMedidaImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IUnidadesMedidaImportacionService
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

        // Extraer códigos válidos del archivo Excel
        var codigosExcel = filas
            .Select(x => NormalizarCodigo(x.Get("CODIGO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Obtener códigos que ya existen en la base de datos
        var codigosExistentes = await dbContext.UnidadesMedida
            .AsNoTracking()
            .Where(x => codigosExcel.Contains(x.Codigo))
            .Select(x => x.Codigo)
            .ToListAsync(cancellationToken);

        var codigosExistentesSet = codigosExistentes.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var codigosProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var unidadesNuevas = new List<UnidadesMedidaEntity>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                unidadesNuevas,
                codigosExistentesSet,
                codigosProcesados,
                resultado);
        }

        if (unidadesNuevas.Count == 0)
            return resultado;

        await dbContext.UnidadesMedida.AddRangeAsync(unidadesNuevas, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = unidadesNuevas.Count;
        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        List<UnidadesMedidaEntity> unidadesNuevas,
        HashSet<string> codigosExistentes,
        HashSet<string> codigosProcesados,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        var codigo = NormalizarCodigo(fila.Get("CODIGO"));
        var nombre = NormalizarTexto(fila.Get("NOMBRE"));
        var simbolo = NormalizarTexto(fila.Get("SIMBOLO"));
        var categoria = NormalizarTexto(fila.Get("CATEGORIA"));

        // Validar CODIGO
        if (string.IsNullOrWhiteSpace(codigo))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CODIGO",
                codigo,
                "El código de la unidad de medida es obligatorio.");
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
                    $"Ya existe una unidad de medida registrada con el código '{codigo}'.");
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
                "El nombre de la unidad de medida es obligatorio.");
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

        // Validar SIMBOLO
        if (string.IsNullOrWhiteSpace(simbolo))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "SIMBOLO",
                simbolo,
                "El símbolo es obligatorio.");
            tieneError = true;
        }
        else if (simbolo.Length > 20)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "SIMBOLO",
                simbolo,
                "El símbolo no puede superar los 20 caracteres.");
            tieneError = true;
        }

        // Validar CATEGORIA
        if (string.IsNullOrWhiteSpace(categoria))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CATEGORIA",
                categoria,
                "La categoría es obligatoria.");
            tieneError = true;
        }
        else if (categoria.Length > 50)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "CATEGORIA",
                categoria,
                "La categoría no puede superar los 50 caracteres.");
            tieneError = true;
        }

        if (tieneError)
            return;

        unidadesNuevas.Add(new UnidadesMedidaEntity
        {
            Codigo = codigo!,
            Nombre = nombre!,
            Simbolo = simbolo!,
            Categoria = categoria!,
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
            "NOMBRE",
            "SIMBOLO",
            "CATEGORIA"
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
