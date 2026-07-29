using System.Globalization;
using System.Text;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Seed;

public static class RecursosHumanosDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("RecursosHumanosDbSeeder");

        var context = services.GetRequiredService<RecursosHumanosDbContext>();

        await context.Database.MigrateAsync();
        await SeedCatalogAsync(context);

        logger.LogInformation("Migraciones y datos iniciales de RecursosHumanos aplicadas correctamente.");
    }

    public static async Task SeedEmpleadosMedicosAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("RecursosHumanosDbSeeder");
        var configuration = services.GetRequiredService<IConfiguration>();

        if (!configuration.GetValue("Seed:SeedDemoEmpleados", true))
        {
            logger.LogInformation("Seed de empleados y médicos demo deshabilitado.");
            return;
        }

        var recursosHumanosContext = services.GetRequiredService<RecursosHumanosDbContext>();
        var personasContext = services.GetRequiredService<PersonasDbContext>();

        await SeedEmpleadosAsync(personasContext, recursosHumanosContext, logger);
        await SeedMedicosAsync(personasContext, recursosHumanosContext, logger);
        await SeedResponsablesAsync(recursosHumanosContext, logger);
        await SeedTurnosAsync(recursosHumanosContext, logger);
        await SeedProgramacionDiariaAsync(recursosHumanosContext, logger);

        logger.LogInformation("Seed demo de RecursosHumanos aplicado correctamente.");
    }

    private static async Task SeedCatalogAsync(RecursosHumanosDbContext context)
    {
        await SeedTiposAreaAsync(context);
        await SeedAreasAsync(context);
        await SeedCargosAsync(context);
        await SeedProfesionesAsync(context);
        await SeedEspecialidadesAsync(context);
    }

    private static async Task SeedTiposAreaAsync(RecursosHumanosDbContext context)
    {
        foreach (var item in RecursosHumanosCatalogSeedData.TiposArea)
        {
            var tipoArea = await context.TiposArea.FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (tipoArea is null)
            {
                context.TiposArea.Add(new TipoArea
                {
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = null,
                    Orden = item.Orden
                });
            }
            else
            {
                tipoArea.Nombre = item.Nombre;
                tipoArea.Descripcion = null;
                tipoArea.Orden = item.Orden;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedAreasAsync(RecursosHumanosDbContext context)
    {
        var tiposArea = await context.TiposArea
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        var areaIdsByCodigo = await context.Areas
            .AsNoTracking()
            .ToDictionaryAsync(x => x.Codigo, x => x.Id);

        foreach (var item in RecursosHumanosDemoSeedData.Areas)
        {
            if (!tiposArea.TryGetValue(item.TipoAreaCodigo, out var tipoAreaId))
                throw new InvalidOperationException(
                    $"No se encontró el tipo de área '{item.TipoAreaCodigo}' para sembrar áreas.");

            Guid? areaPadreId = null;
            if (item.AreaPadreCodigo is not null)
            {
                if (!areaIdsByCodigo.TryGetValue(item.AreaPadreCodigo, out var padreId))
                    throw new InvalidOperationException(
                        $"No se encontró el área padre '{item.AreaPadreCodigo}' para '{item.Codigo}'.");

                areaPadreId = padreId;
            }

            var area = await context.Areas.FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (area is null)
            {
                area = new Area
                {
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = null,
                    TipoAreaId = tipoAreaId,
                    AreaPadreId = areaPadreId
                };
                context.Areas.Add(area);
            }
            else
            {
                area.Nombre = item.Nombre;
                area.Descripcion = null;
                area.TipoAreaId = tipoAreaId;
                area.AreaPadreId = areaPadreId;
            }

            await context.SaveChangesAsync();
            areaIdsByCodigo[item.Codigo] = area.Id;
        }
    }

    private static async Task SeedCargosAsync(RecursosHumanosDbContext context)
    {
        foreach (var nombre in DistinctNames(RecursosHumanosCatalogSeedData.Cargos))
        {
            var codigo = ToCode(nombre);
            var cargo = await context.Cargos.FirstOrDefaultAsync(x => x.Codigo == codigo);

            if (cargo is null)
            {
                context.Cargos.Add(new Cargo
                {
                    Codigo = codigo,
                    Nombre = nombre,
                    Descripcion = null
                });
            }
            else
            {
                cargo.Nombre = nombre;
                cargo.Descripcion = null;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedProfesionesAsync(RecursosHumanosDbContext context)
    {
        foreach (var nombre in DistinctNames(RecursosHumanosCatalogSeedData.Profesiones))
        {
            var codigo = ToCode(nombre);
            var profesion = await context.Profesiones.FirstOrDefaultAsync(x => x.Codigo == codigo);

            if (profesion is null)
            {
                context.Profesiones.Add(new Profesion
                {
                    Codigo = codigo,
                    Nombre = nombre,
                    Descripcion = null
                });
            }
            else
            {
                profesion.Nombre = nombre;
                profesion.Descripcion = null;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedEspecialidadesAsync(RecursosHumanosDbContext context)
    {
        foreach (var nombre in DistinctNames(RecursosHumanosCatalogSeedData.Especialidades))
        {
            var codigo = ToCode(nombre);
            var especialidad = await context.Especialidades.FirstOrDefaultAsync(x => x.Codigo == codigo);

            if (especialidad is null)
            {
                context.Especialidades.Add(new Especialidad
                {
                    Codigo = codigo,
                    Nombre = nombre,
                    Descripcion = null
                });
            }
            else
            {
                especialidad.Nombre = nombre;
                especialidad.Descripcion = null;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedEmpleadosAsync(
        PersonasDbContext personasContext,
        RecursosHumanosDbContext recursosHumanosContext,
        ILogger logger)
    {
        foreach (var item in RecursosHumanosDemoSeedData.Empleados)
        {
            var persona = await personasContext.Personas
                .FirstOrDefaultAsync(x => x.NumeroDocumento == item.NumeroDocumento);

            if (persona is null)
            {
                logger.LogWarning(
                    "Persona con documento '{Documento}' no encontrada; omitiendo empleado '{Codigo}'.",
                    item.NumeroDocumento,
                    item.CodigoEmpleado);
                continue;
            }

            var area = await recursosHumanosContext.Areas
                .FirstOrDefaultAsync(x => x.Codigo == item.AreaCodigo);

            var profesion = await recursosHumanosContext.Profesiones
                .FirstOrDefaultAsync(x => x.Nombre == item.ProfesionNombre);

            var cargo = await recursosHumanosContext.Cargos
                .FirstOrDefaultAsync(x => x.Nombre == item.CargoNombre);

            if (area is null || profesion is null || cargo is null)
            {
                logger.LogWarning(
                    "Catálogo incompleto para empleado '{Codigo}'; omitiendo.",
                    item.CodigoEmpleado);
                continue;
            }

            var empleado = await recursosHumanosContext.Empleados
                .FirstOrDefaultAsync(x =>
                    x.CodigoEmpleado == item.CodigoEmpleado ||
                    x.PersonaId == persona.Id);

            if (empleado is null)
            {
                recursosHumanosContext.Empleados.Add(new Empleado
                {
                    PersonaId = persona.Id,
                    CodigoEmpleado = item.CodigoEmpleado,
                    FechaIngreso = RecursosHumanosDemoSeedData.DemoFechaIngreso,
                    AreaId = area.Id,
                    ProfesionId = profesion.Id,
                    CargoId = cargo.Id
                });
            }
            else
            {
                empleado.PersonaId = persona.Id;
                empleado.CodigoEmpleado = item.CodigoEmpleado;
                empleado.FechaIngreso = RecursosHumanosDemoSeedData.DemoFechaIngreso;
                empleado.AreaId = area.Id;
                empleado.ProfesionId = profesion.Id;
                empleado.CargoId = cargo.Id;
            }
        }

        await recursosHumanosContext.SaveChangesAsync();
    }

    private static async Task SeedMedicosAsync(
        PersonasDbContext personasContext,
        RecursosHumanosDbContext recursosHumanosContext,
        ILogger logger)
    {
        foreach (var item in RecursosHumanosDemoSeedData.Medicos)
        {
            var persona = await personasContext.Personas
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.NumeroDocumento == item.NumeroDocumento);

            if (persona is null)
            {
                logger.LogWarning(
                    "Persona con documento '{Documento}' no encontrada; omitiendo médico.",
                    item.NumeroDocumento);
                continue;
            }

            var empleado = await recursosHumanosContext.Empleados
                .FirstOrDefaultAsync(x => x.PersonaId == persona.Id);

            if (empleado is null)
            {
                logger.LogWarning(
                    "Empleado para documento '{Documento}' no encontrado; omitiendo médico.",
                    item.NumeroDocumento);
                continue;
            }

            var especialidadNombres = item.OtrasEspecialidades
                .Prepend(item.EspecialidadPrincipalNombre)
                .Distinct()
                .ToArray();

            var especialidades = await recursosHumanosContext.Especialidades
                .Where(x => especialidadNombres.Contains(x.Nombre))
                .ToListAsync();

            if (especialidades.Count != especialidadNombres.Length)
            {
                logger.LogWarning(
                    "Especialidades incompletas para médico con documento '{Documento}'; omitiendo.",
                    item.NumeroDocumento);
                continue;
            }

            var especialidadPrincipal = especialidades
                .First(x => x.Nombre == item.EspecialidadPrincipalNombre);

            var medico = await personasContext.Medicos
                .Include(x => x.Especialidades)
                .FirstOrDefaultAsync(x =>
                    x.EmpleadoId == empleado.Id ||
                    x.MatriculaProfesional == item.MatriculaProfesional);

            if (medico is null)
            {
                medico = new Medico
                {
                    EmpleadoId = empleado.Id,
                    MatriculaProfesional = item.MatriculaProfesional,
                    RegistroColegioMedico = item.RegistroColegioMedico
                };

                personasContext.Medicos.Add(medico);
            }
            else
            {
                medico.EmpleadoId = empleado.Id;
                medico.MatriculaProfesional = item.MatriculaProfesional;
                medico.RegistroColegioMedico = item.RegistroColegioMedico;
            }

            SyncMedicoEspecialidades(
                medico,
                especialidades,
                especialidadPrincipal.Id);
        }

        await personasContext.SaveChangesAsync();
    }

    private static async Task SeedResponsablesAsync(
        RecursosHumanosDbContext context,
        ILogger logger)
    {
        var codigosEmpleado = RecursosHumanosDemoSeedData.Responsables
            .Select(x => x.CodigoEmpleado)
            .Distinct()
            .ToArray();

        var empleados = await context.Empleados
            .AsNoTracking()
            .Where(x => codigosEmpleado.Contains(x.CodigoEmpleado))
            .ToDictionaryAsync(x => x.CodigoEmpleado, x => x.Id);

        foreach (var (areaCodigo, codigoEmpleado) in RecursosHumanosDemoSeedData.Responsables)
        {
            if (!empleados.TryGetValue(codigoEmpleado, out var empleadoId))
            {
                logger.LogWarning(
                    "Empleado '{Codigo}' no encontrado; omitiendo responsable de área '{Area}'.",
                    codigoEmpleado,
                    areaCodigo);
                continue;
            }

            var area = await context.Areas.FirstOrDefaultAsync(x => x.Codigo == areaCodigo);
            if (area is null)
            {
                logger.LogWarning(
                    "Área '{Area}' no encontrada; omitiendo asignación de responsable.",
                    areaCodigo);
                continue;
            }

            area.ResponsableEmpleadoId = empleadoId;
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedTurnosAsync(
        RecursosHumanosDbContext context,
        ILogger logger)
    {
        foreach (var item in RecursosHumanosDemoSeedData.Turnos)
        {
            var turno = await context.Turnos.FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (turno is null)
            {
                context.Turnos.Add(new Turno
                {
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    HoraInicio = item.HoraInicio,
                    HoraFin = item.HoraFin,
                    CruceDia = item.CruceDia,
                    Activo = item.Activo,
                    PermiteMultiplesMedicosTurno = item.PermiteMultiplesMedicosTurno
                });
            }
            else
            {
                turno.Nombre = item.Nombre;
                turno.HoraInicio = item.HoraInicio;
                turno.HoraFin = item.HoraFin;
                turno.CruceDia = item.CruceDia;
                turno.Activo = item.Activo;
                turno.PermiteMultiplesMedicosTurno = item.PermiteMultiplesMedicosTurno;
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Seed de turnos aplicado ({Count}).", RecursosHumanosDemoSeedData.Turnos.Length);
    }

    private static async Task SeedProgramacionDiariaAsync(
        RecursosHumanosDbContext context,
        ILogger logger)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Now);
        var gruposCreados = 0;
        var detallesCreados = 0;

        var gruposPorCodigo = new Dictionary<string, GrupoProgramacion>(StringComparer.OrdinalIgnoreCase);

        foreach (var item in RecursosHumanosDemoSeedData.GruposProgramacion)
        {
            var area = await context.Areas
                .FirstOrDefaultAsync(x => x.Codigo == item.AreaCodigo);

            if (area is null)
            {
                logger.LogWarning(
                    "Área '{Area}' no encontrada para grupo '{Codigo}'; omitiendo.",
                    item.AreaCodigo,
                    item.Codigo);
                continue;
            }

            var grupo = await context.GrupoProgramacion
                .FirstOrDefaultAsync(x => x.Codigo == item.Codigo);

            if (grupo is null)
            {
                grupo = new GrupoProgramacion
                {
                    Codigo = item.Codigo,
                    Nombre = item.Nombre,
                    Descripcion = item.Descripcion,
                    AreaId = area.Id
                };
                context.GrupoProgramacion.Add(grupo);
                gruposCreados++;
            }
            else
            {
                grupo.Nombre = item.Nombre;
                grupo.Descripcion = item.Descripcion;
                grupo.AreaId = area.Id;
            }

            gruposPorCodigo[item.Codigo] = grupo;
        }

        await context.SaveChangesAsync();

        var offsets = RecursosHumanosDemoSeedData.ProgramacionesDiarias
            .Select(x => x.OffsetDias)
            .DefaultIfEmpty(0)
            .ToList();
        var fechaInicio = hoy.AddDays(offsets.Min());
        var fechaFin = hoy.AddDays(offsets.Max());

        var programacionesPorGrupo = new Dictionary<Guid, Programacion>();

        foreach (var grupo in gruposPorCodigo.Values)
        {
            var programacion = await context.Programacion
                .FirstOrDefaultAsync(x =>
                    x.GrupoProgramacionId == grupo.Id &&
                    x.FechaInicio == fechaInicio &&
                    x.FechaFin == fechaFin);

            if (programacion is null)
            {
                programacion = new Programacion
                {
                    Nombre = $"Programación demo {fechaInicio:yyyy-MM-dd} – {grupo.Nombre}",
                    FechaInicio = fechaInicio,
                    FechaFin = fechaFin,
                    GrupoProgramacionId = grupo.Id,
                    Estado = Domain.Enums.EstadoProgramacion.Publicada,
                    Observacion = "Seed demo"
                };
                context.Programacion.Add(programacion);
            }
            else
            {
                programacion.Nombre = $"Programación demo {fechaInicio:yyyy-MM-dd} – {grupo.Nombre}";
                programacion.Estado = Domain.Enums.EstadoProgramacion.Publicada;
            }

            programacionesPorGrupo[grupo.Id] = programacion;
        }

        await context.SaveChangesAsync();

        foreach (var item in RecursosHumanosDemoSeedData.ProgramacionesDiarias)
        {
            if (!gruposPorCodigo.TryGetValue(item.GrupoCodigo, out var grupo))
            {
                logger.LogWarning(
                    "Grupo '{Grupo}' no encontrado para detalle '{Codigo}'; omitiendo.",
                    item.GrupoCodigo,
                    item.CodigoSeed);
                continue;
            }

            if (!programacionesPorGrupo.TryGetValue(grupo.Id, out var programacion))
                continue;

            var empleado = await context.Empleados
                .FirstOrDefaultAsync(x => x.CodigoEmpleado == item.CodigoEmpleado);

            var turno = await context.Turnos
                .FirstOrDefaultAsync(x => x.Codigo == item.TurnoCodigo);

            if (empleado is null || turno is null)
            {
                logger.LogWarning(
                    "Catálogo incompleto para detalle '{Codigo}'; omitiendo.",
                    item.CodigoSeed);
                continue;
            }

            var miembro = await context.GrupoProgramacionEmpleado
                .FirstOrDefaultAsync(x =>
                    x.GrupoProgramacionId == grupo.Id &&
                    x.EmpleadoId == empleado.Id);

            if (miembro is null)
            {
                context.GrupoProgramacionEmpleado.Add(new GrupoProgramacionEmpleado
                {
                    GrupoProgramacionId = grupo.Id,
                    EmpleadoId = empleado.Id
                });
            }

            var fecha = hoy.AddDays(item.OffsetDias);

            var existing = await context.ProgramacionDiaria
                .FirstOrDefaultAsync(x =>
                    x.EmpleadoId == empleado.Id &&
                    x.Fecha == fecha &&
                    x.TurnoId == turno.Id);

            if (existing is null)
            {
                context.ProgramacionDiaria.Add(new ProgramacionDiaria
                {
                    ProgramacionId = programacion.Id,
                    EmpleadoId = empleado.Id,
                    Fecha = fecha,
                    TurnoId = turno.Id,
                    TipoAsignacion = (Domain.Enums.TipoAsignacionProgramacion)item.TipoAsignacion,
                    Observacion = item.Observacion
                });
                detallesCreados++;
            }
            else
            {
                existing.ProgramacionId = programacion.Id;
                existing.TipoAsignacion = (Domain.Enums.TipoAsignacionProgramacion)item.TipoAsignacion;
                existing.Observacion = item.Observacion;
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation(
            "Seed de programación aplicado ({Grupos} grupos, {Detalles} detalles nuevos / {Total} definidos).",
            gruposCreados,
            detallesCreados,
            RecursosHumanosDemoSeedData.ProgramacionesDiarias.Length);
    }

    private static void SyncMedicoEspecialidades(
        Medico medico,
        IReadOnlyList<Especialidad> especialidades,
        Guid especialidadPrincipalId)
    {
        var especialidadIds = especialidades.Select(x => x.Id).ToHashSet();

        var toRemove = medico.Especialidades
            .Where(x => !especialidadIds.Contains(x.EspecialidadId))
            .ToList();

        foreach (var item in toRemove)
            medico.Especialidades.Remove(item);

        foreach (var especialidad in especialidades)
        {
            var existing = medico.Especialidades
                .FirstOrDefault(x => x.EspecialidadId == especialidad.Id);

            if (existing is null)
            {
                medico.Especialidades.Add(new MedicoEspecialidad
                {
                    EspecialidadId = especialidad.Id,
                    EsPrincipal = especialidad.Id == especialidadPrincipalId
                });
            }
            else
            {
                existing.EsPrincipal = especialidad.Id == especialidadPrincipalId;
            }
        }
    }

    private static IEnumerable<string> DistinctNames(IEnumerable<string> values) =>
        values
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .DistinctBy(ToCode);

    private static string ToCode(string value)
    {
        var normalized = value.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
                continue;

            var upper = char.ToUpperInvariant(c);

            if (char.IsLetterOrDigit(upper))
            {
                builder.Append(upper);
            }
            else if (builder.Length > 0 && builder[^1] != '_')
            {
                builder.Append('_');
            }
        }

        return builder.ToString().Trim('_');
    }
}
