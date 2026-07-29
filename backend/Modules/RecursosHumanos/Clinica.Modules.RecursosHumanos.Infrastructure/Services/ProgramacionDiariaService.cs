using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Enums;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class ProgramacionDiariaService(
    RecursosHumanosDbContext context,
    PersonasDbContext personasContext
) : IProgramacionDiariaService
{
    public Task<PagedResult<ProgramacionDiariaResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new ProgramacionDiariaPagedRequest { Page = request.Page, PageSize = request.PageSize },
            cancellationToken);
    }

    public async Task<PagedResult<ProgramacionDiariaResponse>> GetPagedAsync(
        ProgramacionDiariaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(includeTracking: false);

        if (request.Fecha is { } fecha)
            query = query.Where(x => x.Fecha == fecha);

        if (request.FechaDesde is { } desde)
            query = query.Where(x => x.Fecha >= desde);

        if (request.FechaHasta is { } hasta)
            query = query.Where(x => x.Fecha <= hasta);

        if (request.EmpleadoId is { } empleadoId && empleadoId != Guid.Empty)
            query = query.Where(x => x.EmpleadoId == empleadoId);

        if (request.TurnoId is { } turnoId && turnoId != Guid.Empty)
            query = query.Where(x => x.TurnoId == turnoId);

        if (request.ProgramacionId is { } programacionId && programacionId != Guid.Empty)
            query = query.Where(x => x.ProgramacionId == programacionId);

        if (request.GrupoProgramacionId is { } grupoId && grupoId != Guid.Empty)
            query = query.Where(x => x.Programacion.GrupoProgramacionId == grupoId);

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.Programacion.GrupoProgramacion.AreaId == areaId);

        if (request.TipoAsignacion is { } tipoAsignacion)
            query = query.Where(x => (int)x.TipoAsignacion == tipoAsignacion);

        if (request.EstadoProgramacion is { } estado)
            query = query.Where(x => (int)x.Programacion.Estado == estado);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Empleado.CodigoEmpleado.Contains(search) ||
                x.Programacion.Nombre.Contains(search) ||
                x.Programacion.GrupoProgramacion.Nombre.Contains(search) ||
                x.Programacion.GrupoProgramacion.Area.Nombre.Contains(search) ||
                (x.Turno != null && x.Turno.Nombre.Contains(search)) ||
                context.Set<Persona>().Any(p =>
                    p.Id == x.Empleado.PersonaId &&
                    (p.Nombres.Contains(search) ||
                     p.ApellidoPaterno.Contains(search) ||
                     p.ApellidoMaterno.Contains(search))));
        }

        var paged = await query
            .OrderByDescending(x => x.Fecha)
            .ThenBy(x => x.Turno != null ? x.Turno.HoraInicio : TimeOnly.MinValue)
            .ToPagedResultAsync(request, cancellationToken);

        var medicoIds = await LoadMedicoIdsByEmpleadoIdsAsync(
            paged.Items.Select(x => x.EmpleadoId).Distinct().ToList(),
            cancellationToken);

        var nombres = await LoadEmpleadoNombresAsync(
            paged.Items.Select(x => x.EmpleadoId).Distinct().ToList(),
            cancellationToken);

        var responses = paged.Items
            .Select(x => ToResponse(
                x,
                medicoIds.GetValueOrDefault(x.EmpleadoId),
                nombres.GetValueOrDefault(x.EmpleadoId, string.Empty)))
            .ToList();

        return new PagedResult<ProgramacionDiariaResponse>(
            responses,
            paged.TotalRecords,
            paged.Page,
            paged.PageSize);
    }

    public async Task<ProgramacionDiariaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery(includeTracking: false)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            return null;

        var medicoId = await GetMedicoIdByEmpleadoIdAsync(entity.EmpleadoId, cancellationToken);
        var nombre = await GetEmpleadoNombreAsync(entity.EmpleadoId, cancellationToken);
        return ToResponse(entity, medicoId, nombre);
    }

    public async Task<ProgramacionDiariaResponse> CreateAsync(
        CreateProgramacionDiariaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureReferenciasExistAsync(request, cancellationToken);

        var entity = MapFromCreate(request);
        await EnsureNoTraslapeAsync(entity, null, cancellationToken);

        context.ProgramacionDiaria.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ProgramacionDiariaResponse> UpdateAsync(
        Guid id,
        UpdateProgramacionDiariaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureReferenciasExistAsync(request, cancellationToken);

        var entity = await context.ProgramacionDiaria
            .GetRequiredAsync(id, "Programación diaria no encontrada.", cancellationToken);

        ApplyUpdate(entity, request);
        await EnsureNoTraslapeAsync(entity, id, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ProgramacionDiaria
            .GetRequiredAsync(id, "Programación diaria no encontrada.", cancellationToken);

        context.ProgramacionDiaria.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MedicoDisponibilidadResponse>> GetDisponibilidadAsync(
        MedicoDisponibilidadRequest request,
        CancellationToken cancellationToken = default)
    {
        var fecha = request.Fecha ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var hora = request.Hora ?? TimeOnly.FromDateTime(DateTime.UtcNow);
        var instante = fecha.ToDateTime(hora);

        var query = BuildDisponiblesQuery()
            .Where(x =>
                x.Fecha == fecha ||
                (x.Turno!.CruceDia && x.Fecha == fecha.AddDays(-1)));

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.Programacion.GrupoProgramacion.AreaId == areaId);

        var programaciones = await query
            .OrderBy(x => x.Fecha)
            .ThenBy(x => x.Turno!.HoraInicio)
            .ToListAsync(cancellationToken);

        var medicoIds = await LoadMedicoIdsByEmpleadoIdsAsync(
            programaciones.Select(x => x.EmpleadoId).Distinct().ToList(),
            cancellationToken);

        var result = new List<MedicoDisponibilidadResponse>();

        foreach (var prog in programaciones)
        {
            if (!medicoIds.TryGetValue(prog.EmpleadoId, out var medicoId))
                continue;

            var turno = prog.Turno!;
            var ventana = TurnoVentanaHelper.Crear(
                prog.Fecha,
                turno.HoraInicio,
                turno.HoraFin,
                turno.CruceDia);

            var disponibleAhora = TurnoVentanaHelper.ContieneHora(ventana, instante);

            if (request.SoloDisponiblesAhora && !disponibleAhora)
                continue;

            DateTime? proxima = null;
            if (request.IncluirProximaDisponibilidad && !disponibleAhora)
            {
                proxima = await FindProximaDisponibilidadAsync(
                    prog.EmpleadoId,
                    instante,
                    request.AreaId,
                    cancellationToken);
            }

            var personaRow = await (
                from empleado in context.Empleados.AsNoTracking()
                join p in context.Set<Persona>().AsNoTracking()
                    on empleado.PersonaId equals p.Id
                where empleado.Id == prog.EmpleadoId
                select p
            ).FirstAsync(cancellationToken);

            result.Add(new MedicoDisponibilidadResponse(
                prog.Id,
                prog.ProgramacionId,
                medicoId,
                prog.EmpleadoId,
                $"{personaRow.Nombres} {personaRow.ApellidoPaterno} {personaRow.ApellidoMaterno}".Trim(),
                prog.Programacion.GrupoProgramacion.AreaId,
                prog.Programacion.GrupoProgramacion.Area.Nombre,
                turno.Nombre,
                turno.HoraInicio,
                turno.HoraFin,
                turno.CruceDia,
                disponibleAhora,
                proxima));
        }

        return result;
    }

    public async Task EnsureMedicoDisponibleAsync(
        ValidarMedicoProgramadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var medico = await personasContext.Medicos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.MedicoId, cancellationToken)
            ?? throw new BusinessException("El médico no existe.");

        var fecha = DateOnly.FromDateTime(request.FechaAtencion);

        var programaciones = await BuildDisponiblesQuery()
            .Where(x => x.EmpleadoId == medico.EmpleadoId)
            .Where(x =>
                x.Fecha == fecha ||
                (x.Turno!.CruceDia && x.Fecha == fecha.AddDays(-1)))
            .ToListAsync(cancellationToken);

        var disponible = programaciones.Any(prog =>
            TurnoVentanaHelper.ContieneHora(
                prog.Fecha,
                prog.Turno!.HoraInicio,
                prog.Turno.HoraFin,
                prog.Turno.CruceDia,
                request.FechaAtencion));

        if (!disponible)
        {
            throw new BusinessException(
                "El médico no está programado o disponible para la fecha y hora indicadas.");
        }
    }

    public async Task<IReadOnlyList<ProgramacionLookupResponse>> GetProgramacionesLookupAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.Programacion
            .AsNoTracking()
            .Include(x => x.GrupoProgramacion)
                .ThenInclude(x => x.Area)
            .Where(x => x.Estado != EstadoProgramacion.Cancelada)
            .OrderByDescending(x => x.FechaInicio)
            .ThenBy(x => x.Nombre)
            .Select(x => new ProgramacionLookupResponse(
                x.Id,
                x.Nombre,
                x.Estado,
                x.GrupoProgramacionId,
                x.GrupoProgramacion.Nombre,
                x.GrupoProgramacion.AreaId,
                x.GrupoProgramacion.Area.Nombre,
                x.FechaInicio,
                x.FechaFin))
            .ToListAsync(cancellationToken);
    }

    private IQueryable<ProgramacionDiaria> BuildQuery(bool includeTracking)
    {
        var query = context.ProgramacionDiaria
            .Include(x => x.Empleado)
            .Include(x => x.Turno)
            .Include(x => x.Programacion)
                .ThenInclude(x => x.GrupoProgramacion)
                    .ThenInclude(x => x.Area)
            .AsQueryable();

        return includeTracking ? query : query.AsNoTracking();
    }

    private IQueryable<ProgramacionDiaria> BuildDisponiblesQuery() =>
        BuildQuery(includeTracking: false)
            .Where(x => x.Programacion.Estado == EstadoProgramacion.Publicada)
            .Where(x => x.TipoAsignacion == TipoAsignacionProgramacion.Regular)
            .Where(x => x.TurnoId != null && x.Turno!.Activo);

    private async Task EnsureReferenciasExistAsync(
        CreateProgramacionDiariaRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureProgramacionExistsAsync(request.ProgramacionId, cancellationToken);
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);

        if (request.TurnoId is { } turnoId && turnoId != Guid.Empty)
            await EnsureTurnoExistsAsync(turnoId, cancellationToken);
    }

    private async Task EnsureReferenciasExistAsync(
        UpdateProgramacionDiariaRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureProgramacionExistsAsync(request.ProgramacionId, cancellationToken);
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);

        if (request.TurnoId is { } turnoId && turnoId != Guid.Empty)
            await EnsureTurnoExistsAsync(turnoId, cancellationToken);
    }

    private async Task EnsureNoTraslapeAsync(
        ProgramacionDiaria entity,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        if (entity.TurnoId is null || entity.TipoAsignacion == TipoAsignacionProgramacion.Descanso)
            return;

        var turno = await context.Turnos
            .AsNoTracking()
            .FirstAsync(x => x.Id == entity.TurnoId, cancellationToken);

        var ventanaNueva = TurnoVentanaHelper.Crear(
            entity.Fecha,
            turno.HoraInicio,
            turno.HoraFin,
            turno.CruceDia);

        var existentes = await context.ProgramacionDiaria
            .AsNoTracking()
            .Include(x => x.Turno)
            .Include(x => x.Programacion)
            .Where(x => x.EmpleadoId == entity.EmpleadoId)
            .Where(x => x.TipoAsignacion == TipoAsignacionProgramacion.Regular)
            .Where(x => x.TurnoId != null)
            .Where(x => x.Programacion.Estado != EstadoProgramacion.Cancelada)
            .Where(x => !currentId.HasValue || x.Id != currentId.Value)
            .Where(x =>
                x.Fecha == entity.Fecha ||
                x.Fecha == entity.Fecha.AddDays(-1) ||
                x.Fecha == entity.Fecha.AddDays(1))
            .ToListAsync(cancellationToken);

        foreach (var existente in existentes)
        {
            if (existente.Turno is null)
                continue;

            var ventanaExistente = TurnoVentanaHelper.Crear(
                existente.Fecha,
                existente.Turno.HoraInicio,
                existente.Turno.HoraFin,
                existente.Turno.CruceDia);

            if (ventanaNueva.SeTraslapaCon(ventanaExistente))
            {
                throw new BusinessException(
                    "Existe una programación traslapada para el mismo empleado.");
            }
        }
    }

    private async Task<DateTime?> FindProximaDisponibilidadAsync(
        Guid empleadoId,
        DateTime desde,
        Guid? areaId,
        CancellationToken cancellationToken)
    {
        var query = BuildDisponiblesQuery()
            .Where(x => x.EmpleadoId == empleadoId);

        if (areaId is { } area && area != Guid.Empty)
            query = query.Where(x => x.Programacion.GrupoProgramacion.AreaId == area);

        var programaciones = await query
            .OrderBy(x => x.Fecha)
            .ThenBy(x => x.Turno!.HoraInicio)
            .Take(30)
            .ToListAsync(cancellationToken);

        foreach (var prog in programaciones)
        {
            var inicio = TurnoVentanaHelper.Crear(
                prog.Fecha,
                prog.Turno!.HoraInicio,
                prog.Turno.HoraFin,
                prog.Turno.CruceDia).Inicio;

            if (inicio >= desde)
                return inicio;
        }

        return null;
    }

    private async Task<Dictionary<Guid, Guid>> LoadMedicoIdsByEmpleadoIdsAsync(
        IReadOnlyList<Guid> empleadoIds,
        CancellationToken cancellationToken)
    {
        if (empleadoIds.Count == 0)
            return [];

        return await personasContext.Medicos
            .AsNoTracking()
            .Where(x => empleadoIds.Contains(x.EmpleadoId))
            .ToDictionaryAsync(x => x.EmpleadoId, x => x.Id, cancellationToken);
    }

    private async Task<Guid?> GetMedicoIdByEmpleadoIdAsync(
        Guid empleadoId,
        CancellationToken cancellationToken)
    {
        return await personasContext.Medicos
            .AsNoTracking()
            .Where(x => x.EmpleadoId == empleadoId)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Dictionary<Guid, string>> LoadEmpleadoNombresAsync(
        IReadOnlyList<Guid> empleadoIds,
        CancellationToken cancellationToken)
    {
        if (empleadoIds.Count == 0)
            return [];

        return await (
            from empleado in context.Empleados.AsNoTracking()
            join persona in context.Set<Persona>().AsNoTracking()
                on empleado.PersonaId equals persona.Id
            where empleadoIds.Contains(empleado.Id)
            select new
            {
                empleado.Id,
                Nombre = persona.Nombres + " " + persona.ApellidoPaterno + " " + persona.ApellidoMaterno
            }
        ).ToDictionaryAsync(x => x.Id, x => x.Nombre.Trim(), cancellationToken);
    }

    private async Task<string> GetEmpleadoNombreAsync(
        Guid empleadoId,
        CancellationToken cancellationToken)
    {
        var nombres = await LoadEmpleadoNombresAsync([empleadoId], cancellationToken);
        return nombres.GetValueOrDefault(empleadoId, string.Empty);
    }

    private async Task EnsureProgramacionExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await context.Programacion.AnyAsync(x => x.Id == id, ct))
            throw new BusinessException("La programación no existe.");
    }

    private async Task EnsureEmpleadoExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await context.Empleados.AnyAsync(x => x.Id == id, ct))
            throw new BusinessException("El empleado no existe.");
    }

    private async Task EnsureTurnoExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await context.Turnos.AnyAsync(x => x.Id == id, ct))
            throw new BusinessException("El turno no existe.");
    }

    private static ProgramacionDiaria MapFromCreate(CreateProgramacionDiariaRequest request) =>
        new()
        {
            ProgramacionId = request.ProgramacionId,
            EmpleadoId = request.EmpleadoId,
            Fecha = request.Fecha,
            TurnoId = request.TurnoId is { } t && t != Guid.Empty ? t : null,
            TipoAsignacion = request.TipoAsignacion,
            Observacion = StringNormalize.Optional(request.Observacion)
        };

    private static void ApplyUpdate(ProgramacionDiaria entity, UpdateProgramacionDiariaRequest request)
    {
        entity.ProgramacionId = request.ProgramacionId;
        entity.EmpleadoId = request.EmpleadoId;
        entity.Fecha = request.Fecha;
        entity.TurnoId = request.TurnoId is { } t && t != Guid.Empty ? t : null;
        entity.TipoAsignacion = request.TipoAsignacion;
        entity.Observacion = StringNormalize.Optional(request.Observacion);
    }

    private static ProgramacionDiariaResponse ToResponse(
        ProgramacionDiaria entity,
        Guid? medicoId,
        string empleadoNombre) =>
        new(
            entity.Id,
            entity.ProgramacionId,
            entity.Programacion.Nombre,
            entity.Programacion.Estado,
            entity.Programacion.GrupoProgramacionId,
            entity.Programacion.GrupoProgramacion.Nombre,
            entity.Programacion.GrupoProgramacion.AreaId,
            entity.Programacion.GrupoProgramacion.Area.Codigo,
            entity.Programacion.GrupoProgramacion.Area.Nombre,
            entity.EmpleadoId,
            entity.Empleado.CodigoEmpleado,
            empleadoNombre,
            entity.Fecha,
            entity.TurnoId,
            entity.Turno?.Codigo,
            entity.Turno?.Nombre,
            entity.Turno?.HoraInicio,
            entity.Turno?.HoraFin,
            entity.Turno?.CruceDia,
            entity.TipoAsignacion,
            entity.Observacion,
            medicoId);
}
