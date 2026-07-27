using Clinica.Modules.Laboratorio.Domain.Constants;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Domain.Enums;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Laboratorio.Infrastructure.Seed;

/// <summary>
/// Datos demo operativos: pacientes, solicitudes en varios estados del flujo LABORATORIO
/// y asignaciones de transición al área de Laboratorio.
/// </summary>
public static class LaboratorioDemoSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("LaboratorioDemoSeeder");
        var configuration = services.GetRequiredService<IConfiguration>();

        if (!configuration.GetValue("Seed:SeedDemoLaboratorio", true))
        {
            logger.LogInformation("Seed demo de Laboratorio deshabilitado.");
            return;
        }

        var lab = services.GetRequiredService<LaboratorioDbContext>();
        var personas = services.GetRequiredService<PersonasDbContext>();
        var workflow = services.GetRequiredService<WorkflowDbContext>();

        await SeedWorkflowAssignmentsAsync(workflow, logger);
        var pacientes = await SeedPacientesDemoAsync(personas, logger);
        if (pacientes.Count == 0)
        {
            logger.LogWarning("No se pudieron crear pacientes demo; se omiten solicitudes demo.");
            return;
        }

        var empleadoId = await ResolveEmpleadoLaboratorioAsync(personas, logger);
        if (empleadoId is null)
        {
            logger.LogWarning(
                "No hay empleado de laboratorio (EMP-00005). Se omiten solicitudes demo.");
            return;
        }

        await SeedSolicitudesDemoAsync(lab, workflow, pacientes, empleadoId.Value, logger);
        logger.LogInformation("Seed demo operativo de Laboratorio aplicado.");
    }

    private static async Task SeedWorkflowAssignmentsAsync(
        WorkflowDbContext workflow,
        ILogger logger)
    {
        var definition = await workflow.WorkflowDefinitions
            .Include(x => x.Transitions)
            .ThenInclude(t => t.Assignment)
            .FirstOrDefaultAsync(x => x.Code == "LABORATORIO");

        if (definition is null)
        {
            logger.LogWarning("Definición LABORATORIO no encontrada; omitiendo asignaciones.");
            return;
        }

        // Área Laboratorio (código estable del seed de RH).
        var areaLabId = await workflow.Database
            .SqlQueryRaw<Guid>(
                """
                SELECT TOP 1 Id AS [Value]
                FROM recursos_humanos.Areas
                WHERE Codigo = N'DEP-012' AND IsDeleted = 0
                """)
            .FirstOrDefaultAsync();

        var areaCajaId = await workflow.Database
            .SqlQueryRaw<Guid>(
                """
                SELECT TOP 1 Id AS [Value]
                FROM recursos_humanos.Areas
                WHERE Codigo = N'SER-001' AND IsDeleted = 0
                """)
            .FirstOrDefaultAsync();

        if (areaLabId == Guid.Empty)
        {
            logger.LogWarning("Área DEP-012 no encontrada; omitiendo asignaciones de workflow.");
            return;
        }

        // Transiciones operativas de laboratorio → área Laboratorio.
        var labCodes = new[]
        {
            "ENVIAR_CAJA",
            "TOMAR_MUESTRA",
            "INICIAR_PROCESO",
            "REGISTRAR_RESULTADO",
            "VALIDAR",
            "ENTREGAR",
            "CANCELAR"
        };

        foreach (var code in labCodes)
        {
            foreach (var transition in definition.Transitions.Where(t => t.Code == code))
            {
                await EnsureAreaAssignmentAsync(workflow, transition, areaLabId);
            }
        }

        // REGISTRAR_PAGO → área Cajas (si existe); si no, sin restricción.
        if (areaCajaId != Guid.Empty)
        {
            foreach (var transition in definition.Transitions.Where(t => t.Code == "REGISTRAR_PAGO"))
            {
                await EnsureAreaAssignmentAsync(workflow, transition, areaCajaId);
            }
        }

        await workflow.SaveChangesAsync();
        logger.LogInformation("Asignaciones de workflow LABORATORIO aplicadas.");
    }

    private static async Task EnsureAreaAssignmentAsync(
        WorkflowDbContext workflow,
        WorkflowTransition transition,
        Guid areaId)
    {
        if (transition.Assignment is null)
        {
            transition.Assignment = new WorkflowTransitionAssignment
            {
                WorkflowTransitionId = transition.Id,
                Type = WorkflowAssignmentType.Area,
                AreaId = areaId
            };
            workflow.WorkflowTransitionAssignments.Add(transition.Assignment);
            return;
        }

        transition.Assignment.Type = WorkflowAssignmentType.Area;
        transition.Assignment.AreaId = areaId;
        transition.Assignment.WorkflowCustomQueryId = null;
        transition.Assignment.UpdatedAt = DateTime.UtcNow;
        await Task.CompletedTask;
    }

    private static async Task<List<(string Key, Guid PacienteId)>> SeedPacientesDemoAsync(
        PersonasDbContext personas,
        ILogger logger)
    {
        var tipoDocId = await personas.Set<CatalogoItem>()
            .AsNoTracking()
            .Where(x => x.Codigo == "CI")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        var sexoId = await personas.Set<CatalogoItem>()
            .AsNoTracking()
            .Where(x => x.Codigo == "M" || x.Codigo == "MASC")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (sexoId == Guid.Empty)
        {
            sexoId = await personas.Set<CatalogoItem>()
                .AsNoTracking()
                .Where(x => x.Codigo == "F" || x.Codigo == "FEM")
                .Select(x => x.Id)
                .FirstOrDefaultAsync();
        }

        var estadoCivilId = await personas.Set<CatalogoItem>()
            .AsNoTracking()
            .Where(x => x.Codigo == "SOLTERO" || x.Codigo == "S")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (tipoDocId == Guid.Empty || sexoId == Guid.Empty || estadoCivilId == Guid.Empty)
        {
            logger.LogWarning("Catálogos de persona incompletos; no se crean pacientes demo.");
            return [];
        }

        (string Doc, string Nombres, string ApellidoP, string ApellidoM, DateOnly Nac)[] demos =
        [
            ("90000001", "Ana", "Mamani", "Quispe", new DateOnly(1992, 3, 15)),
            ("90000002", "Carlos", "Choque", "Rojas", new DateOnly(1985, 7, 22)),
            ("90000003", "Lucía", "Vargas", "Flores", new DateOnly(1998, 11, 5)),
        ];

        var result = new List<(string Key, Guid PacienteId)>();

        foreach (var demo in demos)
        {
            var persona = await personas.Personas
                .FirstOrDefaultAsync(x => x.NumeroDocumento == demo.Doc);

            if (persona is null)
            {
                persona = new Persona
                {
                    TipoDocumentoId = tipoDocId,
                    NumeroDocumento = demo.Doc,
                    Nombres = demo.Nombres,
                    ApellidoPaterno = demo.ApellidoP,
                    ApellidoMaterno = demo.ApellidoM,
                    FechaNacimiento = demo.Nac,
                    SexoId = sexoId,
                    EstadoCivilId = estadoCivilId,
                    Telefono = "70111000",
                    Direccion = "Av. Demo Laboratorio 100",
                };
                personas.Personas.Add(persona);
                await personas.SaveChangesAsync();
            }

            var paciente = await personas.Pacientes
                .FirstOrDefaultAsync(x => x.PersonaId == persona.Id);

            if (paciente is null)
            {
                paciente = new Paciente
                {
                    PersonaId = persona.Id,
                    NumeroHistoriaClinica =
                        $"{demo.Nombres[0]}{demo.ApellidoP[0]}{demo.ApellidoM[0]}{demo.Doc}".ToUpperInvariant(),
                };
                personas.Pacientes.Add(paciente);
                await personas.SaveChangesAsync();
            }

            result.Add((demo.Doc, paciente.Id));
        }

        return result;
    }

    private static async Task<Guid?> ResolveEmpleadoLaboratorioAsync(
        PersonasDbContext personas,
        ILogger logger)
    {
        var empleadoId = await personas.Set<Empleado>()
            .AsNoTracking()
            .Where(x => x.CodigoEmpleado == "EMP-00005")
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (empleadoId == Guid.Empty)
        {
            logger.LogWarning("Empleado EMP-00005 no encontrado.");
            return null;
        }

        return empleadoId;
    }

    private static async Task SeedSolicitudesDemoAsync(
        LaboratorioDbContext lab,
        WorkflowDbContext workflow,
        IReadOnlyList<(string Key, Guid PacienteId)> pacientes,
        Guid empleadoId,
        ILogger logger)
    {
        var definition = await workflow.WorkflowDefinitions
            .Include(x => x.States)
            .FirstOrDefaultAsync(x => x.Code == "LABORATORIO");

        if (definition is null)
        {
            logger.LogWarning("Definición LABORATORIO ausente; omitiendo solicitudes demo.");
            return;
        }

        var stateMap = definition.States.ToDictionary(x => x.Code, x => x.Id);

        var pruebas = await lab.Pruebas
            .AsNoTracking()
            .Where(x => new[] { "GLU", "CREA", "HB", "HTO", "COL", "TRIG", "TSH" }.Contains(x.Codigo))
            .ToDictionaryAsync(x => x.Codigo);

        var precios = await lab.PruebaPrecios
            .AsNoTracking()
            .Where(x => x.FechaFin == null)
            .GroupBy(x => x.PruebaId)
            .Select(g => g.OrderByDescending(p => p.FechaInicio).First())
            .ToDictionaryAsync(x => x.PruebaId, x => x.ImporteFacturado);

        if (pruebas.Count == 0)
        {
            logger.LogWarning("Sin pruebas; omitiendo solicitudes demo.");
            return;
        }

        var demos = new (string Numero, string Estado, string Origen, int PacienteIdx, string[] PruebaCodigos)[]
        {
            ("LAB-DEMO-001", SolicitudEstados.Borrador, SolicitudOrigenes.Paciente, 0, ["GLU", "CREA"]),
            ("LAB-DEMO-002", SolicitudEstados.PendientePago, SolicitudOrigenes.Paciente, 1, ["HB", "HTO"]),
            ("LAB-DEMO-003", SolicitudEstados.PendienteMuestra, SolicitudOrigenes.Paciente, 2, ["COL", "TRIG"]),
            ("LAB-DEMO-004", SolicitudEstados.Validado, SolicitudOrigenes.MedicoExterno, 0, ["GLU", "TSH"]),
        };

        foreach (var demo in demos)
        {
            var exists = await lab.Solicitudes.AnyAsync(x => x.Numero == demo.Numero);
            if (exists)
                continue;

            if (!stateMap.TryGetValue(demo.Estado, out var stateId))
                continue;

            var pacienteId = pacientes[Math.Min(demo.PacienteIdx, pacientes.Count - 1)].PacienteId;

            var solicitud = new Solicitud
            {
                Numero = demo.Numero,
                PacienteId = pacienteId,
                Origen = demo.Origen,
                MedicoExternoNombre = demo.Origen == SolicitudOrigenes.MedicoExterno
                    ? "Dr. Demo Externo"
                    : null,
                Estado = demo.Estado,
                Observaciones = $"Solicitud demo en estado {demo.Estado}",
                FechaSolicitud = DateTime.UtcNow.AddDays(-pacientes.Count + demo.PacienteIdx),
            };

            foreach (var codigo in demo.PruebaCodigos)
            {
                if (!pruebas.TryGetValue(codigo, out var prueba))
                    continue;

                precios.TryGetValue(prueba.Id, out var precio);
                if (precio <= 0)
                    precio = 25m;

                solicitud.Detalles.Add(new SolicitudDetalle
                {
                    PruebaId = prueba.Id,
                    PrecioUnitario = precio,
                    Cantidad = 1,
                    EsDerivada = prueba.EsDerivable && codigo == "TSH"
                        && demo.Estado == SolicitudEstados.Validado,
                });
            }

            if (solicitud.Detalles.Count == 0)
                continue;

            if (demo.Estado is SolicitudEstados.PendientePago or SolicitudEstados.PendienteMuestra
                or SolicitudEstados.Validado)
            {
                var monto = solicitud.Detalles.Sum(d => d.PrecioUnitario * d.Cantidad);
                solicitud.Pagos.Add(new SolicitudPago
                {
                    CuentaId = Guid.NewGuid(), // referencia sintética demo (sin cuenta real de caja)
                    MontoTotal = monto,
                    FechaEnvio = DateTime.UtcNow.AddDays(-1),
                    Estado = demo.Estado == SolicitudEstados.PendientePago ? "PENDIENTE" : "PAGADO",
                });
            }

            lab.Solicitudes.Add(solicitud);
            await lab.SaveChangesAsync();

            var instance = new WorkflowInstance
            {
                WorkflowDefinitionId = definition.Id,
                CurrentStateId = stateId,
                ReferenceModule = "Laboratorio",
                ReferenceEntity = "Solicitud",
                ReferenceId = solicitud.Id,
                StartedByEmployeeId = empleadoId,
                StartedAt = DateTime.UtcNow.AddDays(-2),
                IsCompleted = demo.Estado is SolicitudEstados.Entregado or SolicitudEstados.Cancelado,
            };

            // Si el estado es VALIDADO, marcar history mínima desde BORRADOR.
            var borradorId = stateMap[SolicitudEstados.Borrador];
            instance.History.Add(new WorkflowHistory
            {
                FromStateId = borradorId,
                ToStateId = stateId,
                ExecutedByEmployeeId = empleadoId,
                Comment = "Instancia demo sembrada",
                PerformedAt = DateTime.UtcNow.AddDays(-1),
            });

            workflow.WorkflowInstances.Add(instance);
            await workflow.SaveChangesAsync();

            solicitud.WorkflowInstanceId = instance.Id;
            solicitud.UpdatedAt = DateTime.UtcNow;
            await lab.SaveChangesAsync();

            if (demo.Estado == SolicitudEstados.Validado)
            {
                await SeedMuestraYResultadoDemoAsync(lab, solicitud, empleadoId);
            }
        }

        logger.LogInformation("Solicitudes demo de laboratorio creadas/verificadas.");
    }

    private static async Task SeedMuestraYResultadoDemoAsync(
        LaboratorioDbContext lab,
        Solicitud solicitud,
        Guid empleadoId)
    {
        if (await lab.Muestras.AnyAsync(x => x.Codigo == "MUE-DEMO-001"))
            return;

        var detallesLocales = solicitud.Detalles.Where(d => !d.EsDerivada).ToList();
        if (detallesLocales.Count == 0)
            return;

        var muestra = new Muestra
        {
            SolicitudId = solicitud.Id,
            Codigo = "MUE-DEMO-001",
            FechaToma = DateTime.UtcNow.AddHours(-12),
            TomadoPorEmpleadoId = empleadoId,
            Estado = "TOMADA",
            Observaciones = "Muestra demo",
        };

        foreach (var detalle in detallesLocales)
        {
            muestra.Detalles.Add(new MuestraDetalle
            {
                SolicitudDetalleId = detalle.Id,
                Estado = "TOMADA",
            });
        }

        lab.Muestras.Add(muestra);
        await lab.SaveChangesAsync();

        var parametros = await lab.Parametros
            .AsNoTracking()
            .Where(p => detallesLocales.Select(d => d.PruebaId).Contains(p.PruebaId) && p.Activo)
            .ToListAsync();

        var resultado = new Resultado
        {
            SolicitudId = solicitud.Id,
            MuestraId = muestra.Id,
            Estado = "VALIDADO",
            ValidadoPorEmpleadoId = empleadoId,
            FechaValidacion = DateTime.UtcNow.AddHours(-2),
            Observaciones = "Resultado demo validado",
        };

        foreach (var param in parametros)
        {
            var detalle = detallesLocales.First(d => d.PruebaId == param.PruebaId);
            resultado.Detalles.Add(new ResultadoDetalle
            {
                ParametroId = param.Id,
                SolicitudDetalleId = detalle.Id,
                ValorNumerico = param.Codigo.Contains("GLU") ? 95m : 1.1m,
                FueraDeRango = false,
            });
        }

        lab.Resultados.Add(resultado);
        await lab.SaveChangesAsync();
    }
}
