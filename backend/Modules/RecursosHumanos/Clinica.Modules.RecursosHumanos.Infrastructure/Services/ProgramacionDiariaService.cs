using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
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

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.AreaId == areaId);

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
            query = query.Where(x => x.EspecialidadId == especialidadId);

        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());

        if (request.EsMedicoTurno is { } esMedicoTurno)
            query = query.Where(x => x.EsMedicoTurno == esMedicoTurno);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Empleado.CodigoEmpleado.Contains(search) ||
                x.Area.Nombre.Contains(search) ||
                x.Turno.Nombre.Contains(search) ||
                (x.Especialidad != null && x.Especialidad.Nombre.Contains(search)) ||
                context.Set<Persona>().Any(p =>
                    p.Id == x.Empleado.PersonaId &&
                    (p.Nombres.Contains(search) ||
                     p.ApellidoPaterno.Contains(search) ||
                     p.ApellidoMaterno.Contains(search))));
        }

        var paged = await query
            .OrderByDescending(x => x.Fecha)
            .ThenBy(x => x.Turno.HoraInicio)
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

        var turno = await context.Turnos
            .AsNoTracking()
            .FirstAsync(x => x.Id == request.TurnoId, cancellationToken);

        if (!turno.Activo)
            throw new BusinessException("El turno seleccionado no está activo.");

        var entity = MapFromCreate(request);
        await EnsureNoTraslapeAsync(entity, null, cancellationToken);
        await EnsureMedicoPrincipalUnicoAsync(entity, null, turno, cancellationToken);

        context.ProgramacionDiaria.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ProgramacionDiariaResponse> UpdateAsync(
        Guid id,
        UpdateProgramacionDiariaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ProgramacionDiaria
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Programación no encontrada.");

        await EnsureReferenciasExistAsync(request, cancellationToken);

        var turno = await context.Turnos
            .AsNoTracking()
            .FirstAsync(x => x.Id == request.TurnoId, cancellationToken);

        if (!turno.Activo)
            throw new BusinessException("El turno seleccionado no está activo.");

        ApplyUpdate(entity, request);
        await EnsureNoTraslapeAsync(entity, id, cancellationToken);
        await EnsureMedicoPrincipalUnicoAsync(entity, id, turno, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.ProgramacionDiaria
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Programación no encontrada.");

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

        var query = BuildQuery(includeTracking: false)
            .Where(x => x.Estado == ProgramacionDiariaEstados.Activo)
            .Where(x => x.Turno.Activo)
            .Where(x => x.AceptaConsultas);

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.AreaId == areaId);

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
            query = query.Where(x => x.EspecialidadId == especialidadId);

        var programaciones = await query
            .Where(x =>
                x.Fecha == fecha ||
                (x.Turno.CruceDia && x.Fecha == fecha.AddDays(-1)))
            .OrderBy(x => x.Fecha)
            .ThenBy(x => x.Turno.HoraInicio)
            .ToListAsync(cancellationToken);

        var medicoIds = await LoadMedicoIdsByEmpleadoIdsAsync(
            programaciones.Select(x => x.EmpleadoId).Distinct().ToList(),
            cancellationToken);

        var result = new List<MedicoDisponibilidadResponse>();

        foreach (var prog in programaciones)
        {
            if (!medicoIds.TryGetValue(prog.EmpleadoId, out var medicoId))
                continue;

            var ventana = TurnoVentanaHelper.Crear(
                prog.Fecha,
                prog.Turno.HoraInicio,
                prog.Turno.HoraFin,
                prog.Turno.CruceDia);

            var disponibleAhora = TurnoVentanaHelper.ContieneHora(ventana, instante);

            if (request.SoloDisponiblesAhora && !disponibleAhora)
                continue;

            DateTime? proxima = null;
            if (request.IncluirProximaDisponibilidad && !disponibleAhora)
            {
                proxima = await FindProximaDisponibilidadAsync(
                    prog.EmpleadoId,
                    instante,
                    request.EspecialidadId,
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
                medicoId,
                prog.EmpleadoId,
                $"{personaRow.Nombres} {personaRow.ApellidoPaterno} {personaRow.ApellidoMaterno}".Trim(),
                prog.Especialidad?.Nombre,
                prog.EspecialidadId,
                prog.AreaId,
                prog.Area.Nombre,
                prog.Turno.Nombre,
                prog.Turno.HoraInicio,
                prog.Turno.HoraFin,
                prog.Turno.CruceDia,
                prog.EsMedicoTurno,
                prog.AceptaConsultas,
                prog.AceptaSinCita,
                prog.MaxPacientes,
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
        var hora = TimeOnly.FromDateTime(request.FechaAtencion);

        var query = BuildQuery(includeTracking: false)
            .Where(x => x.EmpleadoId == medico.EmpleadoId)
            .Where(x => x.Estado == ProgramacionDiariaEstados.Activo)
            .Where(x => x.Turno.Activo)
            .Where(x => x.AceptaConsultas)
            .Where(x =>
                x.Fecha == fecha ||
                (x.Turno.CruceDia && x.Fecha == fecha.AddDays(-1)));

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
        {
            query = query.Where(x =>
                x.EspecialidadId == especialidadId ||
                x.EspecialidadId == null);
        }

        var programaciones = await query.ToListAsync(cancellationToken);

        var disponible = programaciones.Any(prog =>
            TurnoVentanaHelper.ContieneHora(
                prog.Fecha,
                prog.Turno.HoraInicio,
                prog.Turno.HoraFin,
                prog.Turno.CruceDia,
                request.FechaAtencion));

        if (!disponible)
        {
            throw new BusinessException(
                "El médico no está programado, activo o disponible para la fecha y hora indicadas.");
        }
    }

    private IQueryable<ProgramacionDiaria> BuildQuery(bool includeTracking)
    {
        var query = context.ProgramacionDiaria
            .Include(x => x.Empleado)
            .Include(x => x.Turno)
            .Include(x => x.Area)
            .Include(x => x.Cargo)
            .Include(x => x.Especialidad)
            .AsQueryable();

        return includeTracking ? query : query.AsNoTracking();
    }

    private async Task EnsureReferenciasExistAsync(
        CreateProgramacionDiariaRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);
        await EnsureTurnoExistsAsync(request.TurnoId, cancellationToken);
        await EnsureAreaExistsAsync(request.AreaId, cancellationToken);
        await EnsureCargoExistsAsync(request.CargoId, cancellationToken);

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
            await EnsureEspecialidadExistsAsync(especialidadId, cancellationToken);
    }

    private async Task EnsureReferenciasExistAsync(
        UpdateProgramacionDiariaRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureEmpleadoExistsAsync(request.EmpleadoId, cancellationToken);
        await EnsureTurnoExistsAsync(request.TurnoId, cancellationToken);
        await EnsureAreaExistsAsync(request.AreaId, cancellationToken);
        await EnsureCargoExistsAsync(request.CargoId, cancellationToken);

        if (request.EspecialidadId is { } especialidadId && especialidadId != Guid.Empty)
            await EnsureEspecialidadExistsAsync(especialidadId, cancellationToken);
    }

    private async Task EnsureNoTraslapeAsync(
        ProgramacionDiaria entity,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
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
            .Where(x => x.EmpleadoId == entity.EmpleadoId)
            .Where(x => x.Estado != ProgramacionDiariaEstados.Cancelado)
            .Where(x => !currentId.HasValue || x.Id != currentId.Value)
            .Where(x =>
                x.Fecha == entity.Fecha ||
                x.Fecha == entity.Fecha.AddDays(-1) ||
                x.Fecha == entity.Fecha.AddDays(1))
            .ToListAsync(cancellationToken);

        foreach (var existente in existentes)
        {
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

    private async Task EnsureMedicoPrincipalUnicoAsync(
        ProgramacionDiaria entity,
        Guid? currentId,
        Turno turno,
        CancellationToken cancellationToken)
    {
        if (!entity.EsMedicoTurno)
            return;

        if (entity.PermiteMultiplesMedicosTurno || turno.PermiteMultiplesMedicosTurno)
            return;

        var ventanaNueva = TurnoVentanaHelper.Crear(
            entity.Fecha,
            turno.HoraInicio,
            turno.HoraFin,
            turno.CruceDia);

        var candidatos = await context.ProgramacionDiaria
            .AsNoTracking()
            .Include(x => x.Turno)
            .Where(x => x.AreaId == entity.AreaId)
            .Where(x => x.EsMedicoTurno)
            .Where(x => x.Estado == ProgramacionDiariaEstados.Activo)
            .Where(x => !currentId.HasValue || x.Id != currentId.Value)
            .Where(x =>
                x.Fecha == entity.Fecha ||
                x.Fecha == entity.Fecha.AddDays(-1) ||
                x.Fecha == entity.Fecha.AddDays(1))
            .ToListAsync(cancellationToken);

        foreach (var candidato in candidatos)
        {
            if (candidato.PermiteMultiplesMedicosTurno || candidato.Turno.PermiteMultiplesMedicosTurno)
                continue;

            var ventanaCandidato = TurnoVentanaHelper.Crear(
                candidato.Fecha,
                candidato.Turno.HoraInicio,
                candidato.Turno.HoraFin,
                candidato.Turno.CruceDia);

            if (ventanaNueva.SeTraslapaCon(ventanaCandidato))
            {
                throw new BusinessException(
                    "Ya existe un médico principal de turno para el área y horario indicados.");
            }
        }
    }

    private async Task<DateTime?> FindProximaDisponibilidadAsync(
        Guid empleadoId,
        DateTime desde,
        Guid? especialidadId,
        Guid? areaId,
        CancellationToken cancellationToken)
    {
        var query = BuildQuery(includeTracking: false)
            .Where(x => x.EmpleadoId == empleadoId)
            .Where(x => x.Estado == ProgramacionDiariaEstados.Activo)
            .Where(x => x.Turno.Activo)
            .Where(x => x.AceptaConsultas);

        if (areaId is { } area && area != Guid.Empty)
            query = query.Where(x => x.AreaId == area);

        if (especialidadId is { } esp && esp != Guid.Empty)
            query = query.Where(x => x.EspecialidadId == esp || x.EspecialidadId == null);

        var programaciones = await query
            .OrderBy(x => x.Fecha)
            .ThenBy(x => x.Turno.HoraInicio)
            .Take(30)
            .ToListAsync(cancellationToken);

        foreach (var prog in programaciones)
        {
            var inicio = TurnoVentanaHelper.Crear(
                prog.Fecha,
                prog.Turno.HoraInicio,
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

    private async Task EnsureAreaExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await context.Areas.AnyAsync(x => x.Id == id, ct))
            throw new BusinessException("El área no existe.");
    }

    private async Task EnsureCargoExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await context.Cargos.AnyAsync(x => x.Id == id, ct))
            throw new BusinessException("El cargo no existe.");
    }

    private async Task EnsureEspecialidadExistsAsync(Guid id, CancellationToken ct)
    {
        if (!await context.Especialidades.AnyAsync(x => x.Id == id, ct))
            throw new BusinessException("La especialidad no existe.");
    }

    private static ProgramacionDiaria MapFromCreate(CreateProgramacionDiariaRequest request) =>
        new()
        {
            EmpleadoId = request.EmpleadoId,
            Fecha = request.Fecha,
            TurnoId = request.TurnoId,
            AreaId = request.AreaId,
            CargoId = request.CargoId,
            EspecialidadId = request.EspecialidadId is { } esp && esp != Guid.Empty ? esp : null,
            EsMedicoTurno = request.EsMedicoTurno,
            AceptaConsultas = request.AceptaConsultas,
            AceptaSinCita = request.AceptaSinCita,
            MaxPacientes = request.MaxPacientes,
            Estado = request.Estado.Trim().ToUpperInvariant(),
            Observacion = StringNormalize.Optional(request.Observacion),
            PermiteMultiplesMedicosTurno = request.PermiteMultiplesMedicosTurno
        };

    private static void ApplyUpdate(ProgramacionDiaria entity, UpdateProgramacionDiariaRequest request)
    {
        entity.EmpleadoId = request.EmpleadoId;
        entity.Fecha = request.Fecha;
        entity.TurnoId = request.TurnoId;
        entity.AreaId = request.AreaId;
        entity.CargoId = request.CargoId;
        entity.EspecialidadId = request.EspecialidadId is { } esp && esp != Guid.Empty ? esp : null;
        entity.EsMedicoTurno = request.EsMedicoTurno;
        entity.AceptaConsultas = request.AceptaConsultas;
        entity.AceptaSinCita = request.AceptaSinCita;
        entity.MaxPacientes = request.MaxPacientes;
        entity.Estado = request.Estado.Trim().ToUpperInvariant();
        entity.Observacion = StringNormalize.Optional(request.Observacion);
        entity.PermiteMultiplesMedicosTurno = request.PermiteMultiplesMedicosTurno;
    }

    private static ProgramacionDiariaResponse ToResponse(
        ProgramacionDiaria entity,
        Guid? medicoId,
        string empleadoNombre) =>
        new(
            entity.Id,
            entity.EmpleadoId,
            entity.Empleado.CodigoEmpleado,
            empleadoNombre,
            entity.Fecha,
            entity.TurnoId,
            entity.Turno.Codigo,
            entity.Turno.Nombre,
            entity.Turno.HoraInicio,
            entity.Turno.HoraFin,
            entity.Turno.CruceDia,
            entity.AreaId,
            entity.Area.Codigo,
            entity.Area.Nombre,
            entity.CargoId,
            entity.Cargo.Nombre,
            entity.EspecialidadId,
            entity.Especialidad?.Nombre,
            entity.EsMedicoTurno,
            entity.AceptaConsultas,
            entity.AceptaSinCita,
            entity.MaxPacientes,
            entity.Estado,
            entity.Observacion,
            entity.PermiteMultiplesMedicosTurno,
            medicoId);
}
