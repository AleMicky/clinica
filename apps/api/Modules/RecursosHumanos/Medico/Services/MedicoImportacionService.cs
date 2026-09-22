using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Excel;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Services;

public interface IMedicoImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}

public sealed class MedicoImportacionService(
    AppDbContext dbContext,
    IExcelReader excelReader
) : IMedicoImportacionService
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

        // Extraer identificadores de empleados del Excel (Código o Documento)
        var identificadoresExcel = filas
            .Select(x => NormalizarTexto(x.Get("CODIGO_EMPLEADO") ?? x.Get("NUMERO_DOCUMENTO") ?? x.Get("EMPLEADO")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Extraer matrículas del Excel
        var matriculasExcel = filas
            .Select(x => NormalizarCodigo(x.Get("MATRICULA_PROFESIONAL")))
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // Precargar empleados activos que coincidan por CódigoEmpleado, ID o Número de Documento de Persona
        var empleadosActivos = await dbContext.Empleados
            .Include(x => x.Persona)
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var empleadosPorCodigo = new Dictionary<string, Empleado.Entity.Empleado>(StringComparer.OrdinalIgnoreCase);
        var empleadosPorDocumento = new Dictionary<string, Empleado.Entity.Empleado>(StringComparer.OrdinalIgnoreCase);

        foreach (var emp in empleadosActivos)
        {
            if (!string.IsNullOrWhiteSpace(emp.CodigoEmpleado))
            {
                empleadosPorCodigo[emp.CodigoEmpleado.Trim().ToUpperInvariant()] = emp;
            }
            empleadosPorCodigo[emp.Id.ToString()] = emp;

            if (emp.Persona != null && !string.IsNullOrWhiteSpace(emp.Persona.NumeroDocumento))
            {
                empleadosPorDocumento[emp.Persona.NumeroDocumento.Trim().ToUpperInvariant()] = emp;
            }
        }

        // Obtener médicos existentes (para validar matrículas y empleados ya médicos)
        var medicosExistentes = await dbContext.Medicos
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var matriculasExistentesSet = medicosExistentes
            .Where(x => !string.IsNullOrWhiteSpace(x.MatriculaProfesional))
            .Select(x => x.MatriculaProfesional!.Trim().ToUpperInvariant())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var empleadosConMedicoSet = medicosExistentes
            .Select(x => x.EmpleadoId)
            .ToHashSet();

        // Precargar catálogo de Especialidades
        var especialidadesActivas = await dbContext.Especialidades
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var especialidadesPorCodigo = especialidadesActivas
            .Where(x => !string.IsNullOrWhiteSpace(x.Codigo))
            .GroupBy(x => x.Codigo.Trim().ToUpperInvariant(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        var especialidadesPorNombre = especialidadesActivas
            .Where(x => !string.IsNullOrWhiteSpace(x.Nombre))
            .GroupBy(x => x.Nombre.Trim().ToUpperInvariant(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        // Precargar catálogo de Servicios
        var serviciosActivos = await dbContext.Servicio
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var serviciosPorCodigo = serviciosActivos
            .Where(x => !string.IsNullOrWhiteSpace(x.Codigo))
            .GroupBy(x => x.Codigo.Trim().ToUpperInvariant(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        var serviciosPorNombre = serviciosActivos
            .Where(x => !string.IsNullOrWhiteSpace(x.Nombre))
            .GroupBy(x => x.Nombre.Trim().ToUpperInvariant(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First().Id, StringComparer.OrdinalIgnoreCase);

        var empleadosProcesados = new HashSet<int>();
        var matriculasProcesadas = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var medicosNuevos = new List<Entity.Medico>();
        var acuerdosNuevos = new List<MedicoServicioAcuerdo>();

        foreach (var fila in filas)
        {
            ProcesarFila(
                fila,
                empleadosPorCodigo,
                empleadosPorDocumento,
                matriculasExistentesSet,
                empleadosConMedicoSet,
                empleadosProcesados,
                matriculasProcesadas,
                especialidadesPorCodigo,
                especialidadesPorNombre,
                serviciosPorCodigo,
                serviciosPorNombre,
                medicosNuevos,
                acuerdosNuevos,
                resultado);
        }

        if (medicosNuevos.Count == 0)
            return resultado;

        // Guardar médicos
        await dbContext.Medicos.AddRangeAsync(medicosNuevos, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Guardar acuerdos iniciales asociados
        if (acuerdosNuevos.Count > 0)
        {
            foreach (var ac in acuerdosNuevos)
            {
                if (ac.Medico != null && ac.MedicoId == 0)
                {
                    ac.MedicoId = ac.Medico.Id;
                }
            }
            await dbContext.Set<MedicoServicioAcuerdo>().AddRangeAsync(acuerdosNuevos, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        resultado.Importados = medicosNuevos.Count;
        return resultado;
    }

    private static void ProcesarFila(
        ExcelRow fila,
        Dictionary<string, Empleado.Entity.Empleado> empleadosPorCodigo,
        Dictionary<string, Empleado.Entity.Empleado> empleadosPorDocumento,
        HashSet<string> matriculasExistentes,
        HashSet<int> empleadosConMedico,
        HashSet<int> empleadosProcesados,
        HashSet<string> matriculasProcesadas,
        Dictionary<string, int> especialidadesPorCodigo,
        Dictionary<string, int> especialidadesPorNombre,
        Dictionary<string, int> serviciosPorCodigo,
        Dictionary<string, int> serviciosPorNombre,
        List<Entity.Medico> medicosNuevos,
        List<MedicoServicioAcuerdo> acuerdosNuevos,
        ExcelImportResult resultado)
    {
        var tieneError = false;

        // 1. Identificador de Empleado
        var identificadorEmpleado = NormalizarTexto(fila.Get("CODIGO_EMPLEADO") ?? fila.Get("NUMERO_DOCUMENTO") ?? fila.Get("EMPLEADO"));

        // 2. Datos Médico
        var matriculaProfesional = NormalizarCodigo(fila.Get("MATRICULA_PROFESIONAL"));
        var registroMinisterioSalud = NormalizarTexto(fila.Get("REGISTRO_MINISTERIO_SALUD"));

        // 3. Especialidades
        var especialidadPrincipalTexto = NormalizarTexto(fila.Get("ESPECIALIDAD_PRINCIPAL") ?? fila.Get("CODIGO_ESPECIALIDAD_PRINCIPAL") ?? fila.Get("CODIGO_ESPECIALIDAD") ?? fila.Get("ESPECIALIDAD"));
        var otrasEspecialidadesTexto = NormalizarTexto(fila.Get("OTRAS_ESPECIALIDADES") ?? fila.Get("ESPECIALIDADES_SECUNDARIAS"));

        // 4. Acuerdo de Servicio (Opcional)
        var servicioTexto = NormalizarTexto(fila.Get("CODIGO_SERVICIO") ?? fila.Get("SERVICIO"));
        var importeServicioTexto = NormalizarTexto(fila.Get("IMPORTE_SERVICIO") ?? fila.Get("IMPORTE_TOTAL"));
        var importeClinicaTexto = NormalizarTexto(fila.Get("IMPORTE_CLINICA"));
        var importeMedicoTexto = NormalizarTexto(fila.Get("IMPORTE_MEDICO"));
        var fechaInicioAcuerdoTexto = NormalizarTexto(fila.Get("FECHA_INICIO_ACUERDO"));
        var fechaFinAcuerdoTexto = NormalizarTexto(fila.Get("FECHA_FIN_ACUERDO"));

        // Validar Identificador de Empleado
        Empleado.Entity.Empleado? empleado = null;

        if (string.IsNullOrWhiteSpace(identificadorEmpleado))
        {
            AgregarError(resultado, fila.RowNumber, "CODIGO_EMPLEADO", identificadorEmpleado, "Debe especificar el código de empleado (o número de documento).");
            tieneError = true;
        }
        else
        {
            var key = identificadorEmpleado.ToUpperInvariant();
            if (empleadosPorCodigo.TryGetValue(key, out var empPorCod))
            {
                empleado = empPorCod;
            }
            else if (empleadosPorDocumento.TryGetValue(key, out var empPorDoc))
            {
                empleado = empPorDoc;
            }
            else
            {
                AgregarError(resultado, fila.RowNumber, "CODIGO_EMPLEADO", identificadorEmpleado, $"No se encontró ningún empleado activo registrado con '{identificadorEmpleado}'.");
                tieneError = true;
            }
        }

        if (empleado != null)
        {
            if (empleadosConMedico.Contains(empleado.Id))
            {
                resultado.Omitidos++;
                var nombre = empleado.Persona != null ? $"{empleado.Persona.Nombres} {empleado.Persona.ApellidoPaterno}" : $"ID {empleado.Id}";
                AgregarError(resultado, fila.RowNumber, "CODIGO_EMPLEADO", identificadorEmpleado, $"El empleado '{identificadorEmpleado}' ({nombre}) ya está registrado como médico.");
                tieneError = true;
            }
            else if (!empleadosProcesados.Add(empleado.Id))
            {
                AgregarError(resultado, fila.RowNumber, "CODIGO_EMPLEADO", identificadorEmpleado, "El empleado está repetido dentro del mismo archivo Excel.");
                tieneError = true;
            }
        }

        // Validar Matrícula Profesional
        if (string.IsNullOrWhiteSpace(matriculaProfesional))
        {
            AgregarError(resultado, fila.RowNumber, "MATRICULA_PROFESIONAL", matriculaProfesional, "La matrícula profesional es obligatoria.");
            tieneError = true;
        }
        else
        {
            if (!matriculasProcesadas.Add(matriculaProfesional))
            {
                AgregarError(resultado, fila.RowNumber, "MATRICULA_PROFESIONAL", matriculaProfesional, "La matrícula profesional está repetida dentro del archivo Excel.");
                tieneError = true;
            }

            if (matriculasExistentes.Contains(matriculaProfesional))
            {
                resultado.Omitidos++;
                AgregarError(resultado, fila.RowNumber, "MATRICULA_PROFESIONAL", matriculaProfesional, $"Ya existe un médico registrado con la matrícula profesional '{matriculaProfesional}'.");
                tieneError = true;
            }
        }

        // Validar Especialidad Principal
        int? especialidadPrincipalId = null;
        if (!string.IsNullOrWhiteSpace(especialidadPrincipalTexto))
        {
            var espKey = especialidadPrincipalTexto.ToUpperInvariant();
            if (especialidadesPorCodigo.TryGetValue(espKey, out var idPorCod))
            {
                especialidadPrincipalId = idPorCod;
            }
            else if (especialidadesPorNombre.TryGetValue(espKey, out var idPorNom))
            {
                especialidadPrincipalId = idPorNom;
            }
            else
            {
                AgregarError(resultado, fila.RowNumber, "ESPECIALIDAD_PRINCIPAL", especialidadPrincipalTexto, $"La especialidad '{especialidadPrincipalTexto}' no existe o no está activa.");
                tieneError = true;
            }
        }

        // Validar Otras Especialidades
        var otrasEspecialidadesIds = new List<int>();
        if (!string.IsNullOrWhiteSpace(otrasEspecialidadesTexto))
        {
            var partes = otrasEspecialidadesTexto.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var item in partes)
            {
                var espItemKey = item.Trim().ToUpperInvariant();
                if (string.IsNullOrWhiteSpace(espItemKey)) continue;

                if (especialidadesPorCodigo.TryGetValue(espItemKey, out var idEsp))
                {
                    if (idEsp != especialidadPrincipalId && !otrasEspecialidadesIds.Contains(idEsp))
                        otrasEspecialidadesIds.Add(idEsp);
                }
                else if (especialidadesPorNombre.TryGetValue(espItemKey, out var idEspNom))
                {
                    if (idEspNom != especialidadPrincipalId && !otrasEspecialidadesIds.Contains(idEspNom))
                        otrasEspecialidadesIds.Add(idEspNom);
                }
                else
                {
                    AgregarError(resultado, fila.RowNumber, "OTRAS_ESPECIALIDADES", item.Trim(), $"La especialidad secundaria '{item.Trim()}' no existe en el catálogo activo.");
                    tieneError = true;
                }
            }
        }

        // Validar Acuerdo de Servicio (Opcional)
        int? servicioId = null;
        decimal importeServicio = 0;
        decimal importeClinica = 0;
        decimal importeMedico = 0;
        DateOnly? fechaInicioAcuerdo = null;
        DateOnly? fechaFinAcuerdo = null;

        var tieneDatosAcuerdo = !string.IsNullOrWhiteSpace(servicioTexto) ||
                                !string.IsNullOrWhiteSpace(importeServicioTexto) ||
                                !string.IsNullOrWhiteSpace(importeMedicoTexto);

        if (tieneDatosAcuerdo)
        {
            if (string.IsNullOrWhiteSpace(servicioTexto))
            {
                AgregarError(resultado, fila.RowNumber, "CODIGO_SERVICIO", servicioTexto, "Debe especificar el código o nombre del servicio para el acuerdo.");
                tieneError = true;
            }
            else
            {
                var srvKey = servicioTexto.ToUpperInvariant();
                if (serviciosPorCodigo.TryGetValue(srvKey, out var idSrv))
                {
                    servicioId = idSrv;
                }
                else if (serviciosPorNombre.TryGetValue(srvKey, out var idSrvNom))
                {
                    servicioId = idSrvNom;
                }
                else
                {
                    AgregarError(resultado, fila.RowNumber, "CODIGO_SERVICIO", servicioTexto, $"El servicio '{servicioTexto}' no existe o no está activo.");
                    tieneError = true;
                }
            }

            if (!TryParseDecimal(importeServicioTexto, out importeServicio) || importeServicio <= 0)
            {
                AgregarError(resultado, fila.RowNumber, "IMPORTE_SERVICIO", importeServicioTexto, "El importe del servicio debe ser un número decimal mayor a 0.");
                tieneError = true;
            }

            if (!string.IsNullOrWhiteSpace(importeMedicoTexto))
            {
                if (!TryParseDecimal(importeMedicoTexto, out importeMedico) || importeMedico < 0)
                {
                    AgregarError(resultado, fila.RowNumber, "IMPORTE_MEDICO", importeMedicoTexto, "El importe del médico debe ser un número decimal mayor o igual a 0.");
                    tieneError = true;
                }
            }

            if (!string.IsNullOrWhiteSpace(importeClinicaTexto))
            {
                if (!TryParseDecimal(importeClinicaTexto, out importeClinica) || importeClinica < 0)
                {
                    AgregarError(resultado, fila.RowNumber, "IMPORTE_CLINICA", importeClinicaTexto, "El importe de la clínica debe ser un número decimal mayor o igual a 0.");
                    tieneError = true;
                }
            }
            else if (importeServicio > 0 && importeMedico >= 0)
            {
                importeClinica = Math.Max(0, Math.Round(importeServicio - importeMedico, 2));
            }

            if (importeMedico > importeServicio)
            {
                AgregarError(resultado, fila.RowNumber, "IMPORTE_MEDICO", importeMedicoTexto, "El importe del médico no puede superar el importe total del servicio.");
                tieneError = true;
            }

            if (!string.IsNullOrWhiteSpace(fechaInicioAcuerdoTexto))
            {
                if (!TryParseFecha(fechaInicioAcuerdoTexto, out fechaInicioAcuerdo))
                {
                    AgregarError(resultado, fila.RowNumber, "FECHA_INICIO_ACUERDO", fechaInicioAcuerdoTexto, "La fecha de inicio del acuerdo no tiene un formato válido.");
                    tieneError = true;
                }
            }
            else
            {
                fechaInicioAcuerdo = DateOnly.FromDateTime(DateTime.Today);
            }

            if (!string.IsNullOrWhiteSpace(fechaFinAcuerdoTexto))
            {
                if (!TryParseFecha(fechaFinAcuerdoTexto, out fechaFinAcuerdo))
                {
                    AgregarError(resultado, fila.RowNumber, "FECHA_FIN_ACUERDO", fechaFinAcuerdoTexto, "La fecha de fin del acuerdo no tiene un formato válido.");
                    tieneError = true;
                }
                else if (fechaInicioAcuerdo.HasValue && fechaFinAcuerdo.HasValue && fechaFinAcuerdo.Value < fechaInicioAcuerdo.Value)
                {
                    AgregarError(resultado, fila.RowNumber, "FECHA_FIN_ACUERDO", fechaFinAcuerdoTexto, "La fecha de fin del acuerdo no puede ser anterior a la fecha de inicio.");
                    tieneError = true;
                }
            }
        }

        if (tieneError || empleado is null)
            return;

        var medico = new Entity.Medico
        {
            EmpleadoId = empleado.Id,
            MatriculaProfesional = matriculaProfesional!,
            RegistroMinisterioSalud = registroMinisterioSalud,
            Activo = true
        };

        // Asignar Especialidad Principal
        if (especialidadPrincipalId.HasValue)
        {
            medico.Especialidades.Add(new MedicoEspecialidad
            {
                EspecialidadId = especialidadPrincipalId.Value,
                EsPrincipal = true,
                Activo = true
            });
        }

        // Asignar Especialidades Secundarias
        foreach (var idEspSec in otrasEspecialidadesIds)
        {
            medico.Especialidades.Add(new MedicoEspecialidad
            {
                EspecialidadId = idEspSec,
                EsPrincipal = false,
                Activo = true
            });
        }

        medicosNuevos.Add(medico);

        // Si tiene acuerdo inicial válido
        if (servicioId.HasValue)
        {
            var acuerdo = new MedicoServicioAcuerdo
            {
                Medico = medico,
                ServicioId = servicioId.Value,
                ImporteServicio = importeServicio,
                ImporteClinica = importeClinica,
                ImporteMedico = importeMedico,
                FechaInicio = fechaInicioAcuerdo ?? DateOnly.FromDateTime(DateTime.Today),
                FechaFin = fechaFinAcuerdo,
                Activo = true
            };

            acuerdosNuevos.Add(acuerdo);
        }
    }

    private static void ValidarColumnas(List<ExcelRow> filas, ExcelImportResult resultado)
    {
        if (filas.Count == 0)
            return;

        var primeraFila = filas[0];

        string[] columnasObligatorias =
        [
            "MATRICULA_PROFESIONAL"
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

        var tieneColumnaEmpleado = primeraFila.Values.ContainsKey("CODIGO_EMPLEADO") ||
                                   primeraFila.Values.ContainsKey("NUMERO_DOCUMENTO") ||
                                   primeraFila.Values.ContainsKey("EMPLEADO");

        if (!tieneColumnaEmpleado)
        {
            resultado.Errors.Add(new ExcelImportError
            {
                Row = 1,
                Column = "CODIGO_EMPLEADO",
                Value = null,
                Message = "Debe incluir la columna 'CODIGO_EMPLEADO' (o 'NUMERO_DOCUMENTO') para asociar el médico al empleado existente."
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
            if (DateOnly.TryParseExact(valor, formato, CultureInfo.InvariantCulture, DateTimeStyles.None, out var fechaResultado))
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

        var clean = valor.Trim().Replace("$", "").Replace("Bs", "").Replace(" ", "");

        if (decimal.TryParse(clean, NumberStyles.Any, CultureInfo.InvariantCulture, out resultado))
            return true;

        if (decimal.TryParse(clean, NumberStyles.Any, new CultureInfo("es-ES"), out resultado))
            return true;

        return false;
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
