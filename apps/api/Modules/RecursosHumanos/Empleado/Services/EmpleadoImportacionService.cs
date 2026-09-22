using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Area.Entity;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using AsignacionEmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity.AsignacionEmpleado;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Services;

public interface IEmpleadoImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}

public sealed class EmpleadoImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IEmpleadoImportacionService
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
            .Select(x => NormalizarDocumento(x.Get("NUMERO_DOCUMENTO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Obtener documentos ya existentes en Personas
        var documentosExistentes = await dbContext.Personas
            .AsNoTracking()
            .Where(x => documentosExcel.Contains(x.NumeroDocumento))
            .Select(x => x.NumeroDocumento)
            .ToListAsync(cancellationToken);

        var documentosExistentesSet = documentosExistentes.ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Precargar catálogo de Áreas activas (por Código y por Nombre normalizado)
        var areasActivas = await dbContext.Areas
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var areasPorCodigo = areasActivas
            .Where(x => !string.IsNullOrWhiteSpace(x.Codigo))
            .ToDictionary(x => x.Codigo.Trim().ToUpperInvariant(), x => x.Id, StringComparer.OrdinalIgnoreCase);

        var areasPorNombre = areasActivas
            .ToDictionary(x => x.Nombre.Trim().ToUpperInvariant(), x => x.Id, StringComparer.OrdinalIgnoreCase);

        // Precargar catálogo de Cargos activos (por Código y por Nombre normalizado)
        var cargosActivos = await dbContext.Cargos
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var cargosPorCodigo = cargosActivos
            .Where(x => !string.IsNullOrWhiteSpace(x.Codigo))
            .ToDictionary(x => x.Codigo.Trim().ToUpperInvariant(), x => x.Id, StringComparer.OrdinalIgnoreCase);

        var cargosPorNombre = cargosActivos
            .ToDictionary(x => x.Nombre.Trim().ToUpperInvariant(), x => x.Id, StringComparer.OrdinalIgnoreCase);

        var documentosProcesados = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var empleadosNuevos = new List<Entity.Empleado>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                empleadosNuevos,
                documentosExistentesSet,
                documentosProcesados,
                areasPorCodigo,
                areasPorNombre,
                cargosPorCodigo,
                cargosPorNombre,
                resultado);
        }

        if (empleadosNuevos.Count == 0)
            return resultado;

        // Guardar empleados nuevos y sus personas/asignaciones
        await dbContext.Empleados.AddRangeAsync(empleadosNuevos, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Asignar código correlativo autogenerado internamente a todos los empleados
        foreach (var emp in empleadosNuevos)
        {
            emp.CodigoEmpleado = $"CQ-{emp.Id:D5}";
        }
        await dbContext.SaveChangesAsync(cancellationToken);

        resultado.Importados = empleadosNuevos.Count;
        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        List<Entity.Empleado> empleados,
        HashSet<string> documentosExistentes,
        HashSet<string> documentosProcesados,
        Dictionary<string, int> areasPorCodigo,
        Dictionary<string, int> areasPorNombre,
        Dictionary<string, int> cargosPorCodigo,
        Dictionary<string, int> cargosPorNombre,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        // Persona
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

        // Empleado
        var fechaIngresoTexto = NormalizarTexto(fila.Get("FECHA_INGRESO"));

        // Asignación (opcional)
        var areaTexto = NormalizarTexto(fila.Get("CODIGO_AREA") ?? fila.Get("AREA"));
        var cargoTexto = NormalizarTexto(fila.Get("CODIGO_CARGO") ?? fila.Get("CARGO"));
        var fechaInicioAsignacionTexto = NormalizarTexto(fila.Get("FECHA_INICIO_ASIGNACION"));
        var observacionAsignacion = NormalizarTexto(fila.Get("OBSERVACION_ASIGNACION"));

        // Validaciones obligatorias de Persona
        if (string.IsNullOrWhiteSpace(tipoDocumento))
        {
            AgregarError(resultado, fila.RowNumber, "TIPO_DOCUMENTO", tipoDocumento, "El tipo de documento es obligatorio.");
            tieneError = true;
        }

        if (string.IsNullOrWhiteSpace(numeroDocumento))
        {
            AgregarError(resultado, fila.RowNumber, "NUMERO_DOCUMENTO", numeroDocumento, "El número de documento es obligatorio.");
            tieneError = true;
        }
        else
        {
            // Duplicado dentro del mismo Excel
            if (!documentosProcesados.Add(numeroDocumento))
            {
                AgregarError(resultado, fila.RowNumber, "NUMERO_DOCUMENTO", numeroDocumento, "El número de documento está repetido dentro del archivo Excel.");
                tieneError = true;
            }

            // Ya existe en BD
            if (documentosExistentes.Contains(numeroDocumento))
            {
                resultado.Omitidos++;
                AgregarError(resultado, fila.RowNumber, "NUMERO_DOCUMENTO", numeroDocumento, "Ya existe una persona registrada con este documento.");
                tieneError = true;
            }
        }

        if (string.IsNullOrWhiteSpace(nombres))
        {
            AgregarError(resultado, fila.RowNumber, "NOMBRES", nombres, "Los nombres son obligatorios.");
            tieneError = true;
        }

        if (string.IsNullOrWhiteSpace(apellidoPaterno))
        {
            AgregarError(resultado, fila.RowNumber, "APELLIDO_PATERNO", apellidoPaterno, "El apellido paterno es obligatorio.");
            tieneError = true;
        }

        DateOnly? fechaNacimiento = null;
        if (string.IsNullOrWhiteSpace(fechaNacimientoTexto))
        {
            AgregarError(resultado, fila.RowNumber, "FECHA_NACIMIENTO", fechaNacimientoTexto, "La fecha de nacimiento es obligatoria.");
            tieneError = true;
        }
        else
        {
            if (!TryParseFecha(fechaNacimientoTexto, out fechaNacimiento))
            {
                AgregarError(resultado, fila.RowNumber, "FECHA_NACIMIENTO", fechaNacimientoTexto, "La fecha de nacimiento no tiene un formato válido (use AAAA-MM-DD o DD/MM/AAAA).");
                tieneError = true;
            }
            else if (fechaNacimiento > DateOnly.FromDateTime(DateTime.Today))
            {
                AgregarError(resultado, fila.RowNumber, "FECHA_NACIMIENTO", fechaNacimientoTexto, "La fecha de nacimiento no puede ser futura.");
                tieneError = true;
            }
        }

        var genero = NormalizarGenero(generoTexto);
        if (!string.IsNullOrWhiteSpace(generoTexto) && genero is null)
        {
            AgregarError(resultado, fila.RowNumber, "GENERO", generoTexto, "El género debe ser M, F, Masculino o Femenino.");
            tieneError = true;
        }

        if (!string.IsNullOrWhiteSpace(telefono) && !EsTelefonoValido(telefono))
        {
            AgregarError(resultado, fila.RowNumber, "TELEFONO", telefono, "El número de teléfono no es válido.");
            tieneError = true;
        }

        // Validaciones de Empleado
        DateOnly? fechaIngreso = null;
        if (!string.IsNullOrWhiteSpace(fechaIngresoTexto))
        {
            if (!TryParseFecha(fechaIngresoTexto, out fechaIngreso))
            {
                AgregarError(resultado, fila.RowNumber, "FECHA_INGRESO", fechaIngresoTexto, "La fecha de ingreso no tiene un formato válido (use AAAA-MM-DD o DD/MM/AAAA).");
                tieneError = true;
            }
        }
        else
        {
            fechaIngreso = DateOnly.FromDateTime(DateTime.Today);
        }

        // Validaciones de Asignación (Área y Cargo)
        int? areaId = null;
        int? cargoId = null;

        var tieneArea = !string.IsNullOrWhiteSpace(areaTexto);
        var tieneCargo = !string.IsNullOrWhiteSpace(cargoTexto);

        if (tieneArea || tieneCargo)
        {
            if (!tieneArea)
            {
                AgregarError(resultado, fila.RowNumber, "CODIGO_AREA", areaTexto, "Debe especificar el Área si desea asignar un cargo inicial.");
                tieneError = true;
            }
            else
            {
                var areaKey = areaTexto!.ToUpperInvariant();
                if (areasPorCodigo.TryGetValue(areaKey, out var idPorCod))
                {
                    areaId = idPorCod;
                }
                else if (areasPorNombre.TryGetValue(areaKey, out var idPorNom))
                {
                    areaId = idPorNom;
                }
                else
                {
                    AgregarError(resultado, fila.RowNumber, "CODIGO_AREA", areaTexto, $"El área '{areaTexto}' no existe o no está activa.");
                    tieneError = true;
                }
            }

            if (!tieneCargo)
            {
                AgregarError(resultado, fila.RowNumber, "CODIGO_CARGO", cargoTexto, "Debe especificar el Cargo si desea asignar un área inicial.");
                tieneError = true;
            }
            else
            {
                var cargoKey = cargoTexto!.ToUpperInvariant();
                if (cargosPorCodigo.TryGetValue(cargoKey, out var idPorCod))
                {
                    cargoId = idPorCod;
                }
                else if (cargosPorNombre.TryGetValue(cargoKey, out var idPorNom))
                {
                    cargoId = idPorNom;
                }
                else
                {
                    AgregarError(resultado, fila.RowNumber, "CODIGO_CARGO", cargoTexto, $"El cargo '{cargoTexto}' no existe o no está activo.");
                    tieneError = true;
                }
            }
        }

        DateOnly? fechaInicioAsignacion = null;
        if (!string.IsNullOrWhiteSpace(fechaInicioAsignacionTexto))
        {
            if (!TryParseFecha(fechaInicioAsignacionTexto, out fechaInicioAsignacion))
            {
                AgregarError(resultado, fila.RowNumber, "FECHA_INICIO_ASIGNACION", fechaInicioAsignacionTexto, "La fecha de inicio de asignación no tiene un formato válido.");
                tieneError = true;
            }
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
            EstadoCivil = estadoCivil,
            Activo = true
        };

        var empleado = new Entity.Empleado
        {
            FechaIngreso = fechaIngreso,
            Activo = true,
            Persona = persona
        };

        // Si tiene asignación inicial válida, agregarla a las asignaciones del empleado
        if (areaId.HasValue && cargoId.HasValue)
        {
            var asignacion = new AsignacionEmpleadoEntity
            {
                AreaId = areaId.Value,
                CargoId = cargoId.Value,
                FechaInicio = fechaInicioAsignacion ?? fechaIngreso ?? DateOnly.FromDateTime(DateTime.Today),
                Observacion = observacionAsignacion,
                Activo = true
            };

            empleado.Asignaciones.Add(asignacion);
        }

        empleados.Add(empleado);
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
                continue;

            resultado.Errors.Add(new ExcelImportError
            {
                Row = 1,
                Column = columna,
                Value = null,
                Message = $"No se encontró la columna obligatoria '{columna}' en el Excel."
            });
        }
    }

    private static string? NormalizarDocumento(string? documento)
    {
        if (string.IsNullOrWhiteSpace(documento))
            return null;

        return documento.Trim().ToUpperInvariant().Replace(" ", string.Empty);
    }

    private static string? NormalizarTexto(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        return valor.Trim();
    }

    private static string? NormalizarGenero(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return null;

        var genero = valor.Trim().ToUpperInvariant();

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

    private static bool TryParseFecha(string valor, out DateOnly? fecha)
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
            if (DateOnly.TryParseExact(valor, formato, out var fechaResultado))
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

    private static string? NormalizarTelefono(string? telefono)
    {
        if (string.IsNullOrWhiteSpace(telefono))
            return null;

        return telefono.Trim().Replace(" ", string.Empty).Replace("-", string.Empty);
    }

    private static bool EsTelefonoValido(string? telefono)
    {
        if (string.IsNullOrWhiteSpace(telefono))
            return true;

        return telefono.All(char.IsDigit) && telefono.Length is >= 7 and <= 15;
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
