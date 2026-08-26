using Clinica.Api.Data;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Services;

public interface IPacienteImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}

public sealed class PacienteImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IPacienteImportacionService
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
        
        var documentosExcel = filas
            .Select(x =>
                NormalizarDocumento(
                    x.Get("NUMERO_DOCUMENTO")))
            .Where(x =>
                !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

      
        var documentosExistentes = await dbContext.Personas
            .AsNoTracking()
            .Where(x =>
                documentosExcel.Contains(x.NumeroDocumento))
            .Select(x => x.NumeroDocumento)
            .ToListAsync(cancellationToken);

        var documentosExistentesSet = documentosExistentes.ToHashSet(StringComparer.OrdinalIgnoreCase);
        
        var documentosProcesados =
            new HashSet<string>(
                StringComparer.OrdinalIgnoreCase);

        var pacientesNuevos =
            new List<Paciente>();
        
        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                pacientesNuevos,
                documentosExistentesSet,
                documentosProcesados,
                resultado);
        }
        
        if (pacientesNuevos.Count == 0)
            return resultado;
        
        await dbContext.Pacientes.AddRangeAsync(pacientesNuevos, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        resultado.Importados = pacientesNuevos.Count;

        return resultado;
    }
    
    private static void ProcesarFila(
        ExcelRow fila,
        List<Paciente> pacientes,
        HashSet<string> documentosExistentes,
        HashSet<string> documentosProcesados,
        ExcelImportResult resultado)
    {
        var tieneError = false;
        
        var tipoDocumento = NormalizarTexto(fila.Get("TIPO_DOCUMENTO"));
        var numeroDocumento = NormalizarDocumento(fila.Get("NUMERO_DOCUMENTO"));
        var extensionDocumento = NormalizarTexto(fila.Get("EXTENSION_DOCUMENTO"));
        var complementoDocumento = NormalizarTexto(fila.Get("COMPLEMENTO_DOCUMENTO"));
        var nombres = NormalizarTexto(fila.Get("NOMBRES"));
        var apellidoPaterno = NormalizarTexto(fila.Get("APELLIDO_PATERNO"));
        var apellidoMaterno = NormalizarTexto(fila.Get("APELLIDO_MATERNO"));
        var fechaNacimientoTexto = NormalizarTexto(fila.Get("FECHA_NACIMIENTO"));
        var generoTexto = NormalizarTexto(fila.Get("GENERO"));
        var estadoCivil = NormalizarTexto(fila.Get("ESTADO_CIVIL"));
        var telefono = NormalizarTelefono(fila.Get("TELEFONO"));
        var direccion = NormalizarTexto(fila.Get("DIRECCION"));
        
        if (string.IsNullOrWhiteSpace(tipoDocumento))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "TIPO_DOCUMENTO",
                tipoDocumento,
                "El tipo de documento es obligatorio.");

            tieneError = true;
        }
        
        if (string.IsNullOrWhiteSpace(numeroDocumento))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NUMERO_DOCUMENTO",
                numeroDocumento,
                "El número de documento es obligatorio.");

            tieneError = true;
        }
        else
        {
            // Duplicado dentro del mismo Excel
            if (!documentosProcesados.Add(
                    numeroDocumento))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "NUMERO_DOCUMENTO",
                    numeroDocumento,
                    "El número de documento está repetido dentro del archivo Excel.");

                tieneError = true;
            }

            // Ya existe en BD
            if (documentosExistentes.Contains(
                    numeroDocumento))
            {
                resultado.Omitidos++;

                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "NUMERO_DOCUMENTO",
                    numeroDocumento,
                    "Ya existe una persona registrada con este documento.");

                tieneError = true;
            }
        }
        
        if (string.IsNullOrWhiteSpace(nombres))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "NOMBRES",
                nombres,
                "Los nombres son obligatorios.");

            tieneError = true;
        }
        
        if (string.IsNullOrWhiteSpace(apellidoPaterno))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "APELLIDO_PATERNO",
                apellidoPaterno,
                "El apellido paterno es obligatorio.");

            tieneError = true;
        }
        
        DateOnly? fechaNacimiento = null;

        if (string.IsNullOrWhiteSpace(
                fechaNacimientoTexto))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "FECHA_NACIMIENTO",
                fechaNacimientoTexto,
                "La fecha de nacimiento es obligatoria.");

            tieneError = true;
        }
        else
        {
            if (!TryParseFecha(
                    fechaNacimientoTexto,
                    out fechaNacimiento))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "FECHA_NACIMIENTO",
                    fechaNacimientoTexto,
                    "La fecha de nacimiento no tiene un formato válido.");

                tieneError = true;
            }
            else if (
                fechaNacimiento >
                DateOnly.FromDateTime(
                    DateTime.Today))
            {
                AgregarError(
                    resultado,
                    fila.RowNumber,
                    "FECHA_NACIMIENTO",
                    fechaNacimientoTexto,
                    "La fecha de nacimiento no puede ser futura.");

                tieneError = true;
            }
        }

    
        var genero = NormalizarGenero(generoTexto);

        if (!string.IsNullOrWhiteSpace(generoTexto)
            && genero is null)
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "GENERO",
                generoTexto,
                "El género debe ser M, F, Masculino o Femenino.");

            tieneError = true;
        }

       
        if (!string.IsNullOrWhiteSpace(telefono)
            && !EsTelefonoValido(telefono))
        {
            AgregarError(
                resultado,
                fila.RowNumber,
                "TELEFONO",
                telefono,
                "El número de teléfono no es válido.");

            tieneError = true;
        }

      
        if (tieneError)
            return;
        
        var persona = new Persona
        {
            Nombres = nombres!,
            ApellidoPaterno = apellidoPaterno!,
            ApellidoMaterno = apellidoMaterno,
            FechaNacimiento = fechaNacimiento!.Value,
            Telefono = telefono,
            Direccion = direccion,
            TipoDocumento = tipoDocumento!,
            NumeroDocumento = numeroDocumento!,
            ExtensionDocumento = extensionDocumento,
            ComplementoDocumento = complementoDocumento,
            Genero = genero,
            EstadoCivil = estadoCivil
        };

     
        var numeroHistoriaClinica =
            GenerarNumeroHistoriaClinica(
                numeroDocumento!,
                nombres!,
                apellidoPaterno!,
                apellidoMaterno);
        
        var paciente = new Paciente
        {
            NumeroHistoriaClinica = numeroHistoriaClinica,
            Persona = persona
        };

        pacientes.Add(paciente);
    }

  
    private static string GenerarNumeroHistoriaClinica(
        string numeroDocumento,
        string nombres,
        string apellidoPaterno,
        string? apellidoMaterno)
    {

        var iniciales = string.Concat(
                ObtenerInicial(nombres),
                ObtenerInicial(apellidoPaterno),
                ObtenerInicial(apellidoMaterno));

        var documento = NormalizarCodigo(numeroDocumento);

        return $"{iniciales}-{documento}";
    }
    
    private static string ObtenerInicial(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        return char
            .ToUpperInvariant(
                value.Trim()[0])
            .ToString();
    }
    
    private static string NormalizarCodigo(string value)
    {
        return new string(
            value
                .Trim()
                .ToUpperInvariant()
                .Where(char.IsLetterOrDigit)
                .ToArray());
    }
    
    private static void ValidarColumnas(List<ExcelRow> filas, ExcelImportResult resultado)
    {
        if (filas.Count == 0)
            return;

        var primeraFila = filas[0];

        string[] columnasObligatorias =
        [
            "TIPO_DOCUMENTO",
            "NUMERO_DOCUMENTO",
            "NOMBRES",
            "APELLIDO_PATERNO",
            "FECHA_NACIMIENTO"
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

    private static string? NormalizarDocumento(
        string? documento)
    {
        if (string.IsNullOrWhiteSpace(documento))
            return null;

        return documento
            .Trim()
            .ToUpperInvariant()
            .Replace(" ", string.Empty);
    }

    private static string? NormalizarTexto(
        string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        return valor.Trim();
    }


    private static string? NormalizarGenero(
        string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        var genero =
            valor
                .Trim()
                .ToUpperInvariant();

        return genero switch
        {
            "M" => "M",
            "MASCULINO" => "M",
            "HOMBRE" => "M",

            "F" => "F",
            "FEMENINO" => "F",
            "MUJER" => "F",

            _ => null
        };
    }

    private static bool TryParseFecha(
        string valor,
        out DateOnly? fecha)
    {
        fecha = null;

        string[] formatos =
        [
            "yyyy-MM-dd",
            "dd/MM/yyyy",
            "dd-MM-yyyy",
            "d/M/yyyy",
            "d-M-yyyy"
        ];

        foreach (var formato in formatos)
        {
            if (!DateOnly.TryParseExact(
                    valor,
                    formato,
                    out var fechaResultado))
            {
                continue;
            }

            fecha = fechaResultado;

            return true;
        }

        /*
         * Intento adicional por si Excel
         * devuelve otra representación válida.
         */
        if (DateOnly.TryParse(
                valor,
                out var fechaGenerica))
        {
            fecha = fechaGenerica;

            return true;
        }

        return false;
    }

    private static string? NormalizarTelefono(string? telefono)
    {
        if (string.IsNullOrWhiteSpace(telefono))
            return null;

        return telefono
            .Trim()
            .Replace(" ", string.Empty)
            .Replace("-", string.Empty);
    }

    private static bool EsTelefonoValido(string? telefono)
    {
        if (string.IsNullOrWhiteSpace(telefono))
            return true;

        return telefono.All(char.IsDigit)
               && telefono.Length is >= 7 and <= 15;
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