using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Medicos;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Empleados;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class EmpleadoService(
    RecursosHumanosDbContext context,
    PersonasDbContext personasContext,
    IMedicoService medicoService
) : IEmpleadoService
{
    public Task<PagedResult<EmpleadoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new EmpleadoPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<EmpleadoResponse>> GetPagedAsync(
        EmpleadoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Empleados
            .AsNoTracking()
            .Include(x => x.Area)
            .Include(x => x.Departamento)
            .Include(x => x.Servicio)
            .Include(x => x.Profesion)
            .Include(x => x.Cargo)
            .AsQueryable();

        if (request.PersonaId is { } personaId && personaId != Guid.Empty)
            query = query.Where(x => x.PersonaId == personaId);

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.AreaId == areaId);

        if (request.DepartamentoId is { } departamentoId && departamentoId != Guid.Empty)
            query = query.Where(x => x.DepartamentoId == departamentoId);

        if (request.ServicioId is { } servicioId && servicioId != Guid.Empty)
            query = query.Where(x => x.ServicioId == servicioId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.CodigoEmpleado.Contains(search) ||
                context.Set<Persona>().Any(p =>
                    p.Id == x.PersonaId &&
                    (p.Nombres.Contains(search) ||
                     p.ApellidoPaterno.Contains(search) ||
                     p.ApellidoMaterno.Contains(search) ||
                     p.NumeroDocumento.Contains(search))));
        }

        var paged = await query
            .OrderBy(x => x.CodigoEmpleado)
            .ToPagedResultAsync(request, cancellationToken);

        var personas = await LoadPersonasByIdsAsync(
            paged.Items.Select(x => x.PersonaId).ToList(),
            cancellationToken);

        var medicos = await LoadMedicosByEmpleadoIdsAsync(
            paged.Items.Select(x => x.Id).ToList(),
            cancellationToken);

        var responses = paged.Items
            .Select(x => ToResponse(
                x,
                personas.GetValueOrDefault(x.PersonaId),
                medicos.GetValueOrDefault(x.Id)))
            .ToList();

        return new PagedResult<EmpleadoResponse>(
            responses,
            paged.TotalRecords,
            paged.Page,
            paged.PageSize);
    }

    public async Task<EmpleadoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Empleados
            .AsNoTracking()
            .Include(x => x.Area)
            .Include(x => x.Departamento)
            .Include(x => x.Servicio)
            .Include(x => x.Profesion)
            .Include(x => x.Cargo)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            return null;

        var persona = await context.Set<Persona>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == entity.PersonaId, cancellationToken);

        var medico = await LoadMedicoByEmpleadoIdAsync(entity.Id, cancellationToken);

        return ToResponse(entity, persona, medico);
    }

    public async Task<EmpleadoResponse> CreateAsync(
        CreateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);
        await EnsurePersonaNotEmpleadoAsync(request.PersonaId, null, cancellationToken);
        await EnsureRecursosHumanosExistAsync(request, cancellationToken);

        var codigo = StringNormalize.Required(request.CodigoEmpleado);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Empleado
        {
            PersonaId = request.PersonaId,
            CodigoEmpleado = codigo,
            FechaIngreso = request.FechaIngreso,
            AreaId = request.AreaId,
            DepartamentoId = request.DepartamentoId,
            ServicioId = request.ServicioId,
            ProfesionId = request.ProfesionId,
            CargoId = request.CargoId
        };

        context.Empleados.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        if (request.EsMedico)
            await CreateMedicoAsync(entity.Id, request.Medico!, cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<EmpleadoResponse> UpdateAsync(
        Guid id,
        UpdateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Empleados
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Empleado no encontrado.");

        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);
        await EnsurePersonaNotEmpleadoAsync(request.PersonaId, id, cancellationToken);
        await EnsureRecursosHumanosExistAsync(request, cancellationToken);

        var codigo = StringNormalize.Required(request.CodigoEmpleado);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.PersonaId = request.PersonaId;
        entity.CodigoEmpleado = codigo;
        entity.FechaIngreso = request.FechaIngreso;
        entity.AreaId = request.AreaId;
        entity.DepartamentoId = request.DepartamentoId;
        entity.ServicioId = request.ServicioId;
        entity.ProfesionId = request.ProfesionId;
        entity.CargoId = request.CargoId;

        await context.SaveChangesAsync(cancellationToken);

        await SyncMedicoAsync(id, request.EsMedico, request.Medico, cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Empleados
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Empleado no encontrado.");

        var hasMedico = await personasContext.Medicos
            .AnyAsync(x => x.EmpleadoId == id, cancellationToken);

        if (hasMedico)
            throw new BusinessException("No se puede eliminar un empleado que está registrado como médico.");

        context.Empleados.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task SyncMedicoAsync(
        Guid empleadoId,
        bool esMedico,
        EmpleadoMedicoRequest? medicoRequest,
        CancellationToken cancellationToken)
    {
        var existingMedico = await personasContext.Medicos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.EmpleadoId == empleadoId, cancellationToken);

        if (esMedico)
        {
            if (medicoRequest is null)
                throw new BusinessException("Complete los datos médicos del empleado.");

            if (existingMedico is null)
            {
                await CreateMedicoAsync(empleadoId, medicoRequest, cancellationToken);
                return;
            }

            await medicoService.UpdateAsync(
                existingMedico.Id,
                new UpdateMedicoRequest(
                    empleadoId,
                    medicoRequest.EspecialidadIds,
                    medicoRequest.EspecialidadPrincipalId,
                    medicoRequest.MatriculaProfesional,
                    medicoRequest.RegistroColegioMedico),
                cancellationToken);
            return;
        }

        if (existingMedico is not null)
            await medicoService.DeleteAsync(existingMedico.Id, cancellationToken);
    }

    private Task<MedicoResponse> CreateMedicoAsync(
        Guid empleadoId,
        EmpleadoMedicoRequest medicoRequest,
        CancellationToken cancellationToken)
    {
        return medicoService.CreateAsync(
            new CreateMedicoRequest(
                empleadoId,
                medicoRequest.EspecialidadIds,
                medicoRequest.EspecialidadPrincipalId,
                medicoRequest.MatriculaProfesional,
                medicoRequest.RegistroColegioMedico),
            cancellationToken);
    }

    private async Task<Dictionary<Guid, Persona>> LoadPersonasByIdsAsync(
        IReadOnlyList<Guid> personaIds,
        CancellationToken cancellationToken)
    {
        if (personaIds.Count == 0)
            return [];

        return await context.Set<Persona>()
            .AsNoTracking()
            .Where(x => personaIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private async Task<Dictionary<Guid, Medico>> LoadMedicosByEmpleadoIdsAsync(
        IReadOnlyList<Guid> empleadoIds,
        CancellationToken cancellationToken)
    {
        if (empleadoIds.Count == 0)
            return [];

        return await personasContext.Medicos
            .AsNoTracking()
            .Include(x => x.Especialidades)
            .ThenInclude(x => x.Especialidad)
            .Where(x => empleadoIds.Contains(x.EmpleadoId))
            .ToDictionaryAsync(x => x.EmpleadoId, cancellationToken);
    }

    private async Task<Medico?> LoadMedicoByEmpleadoIdAsync(
        Guid empleadoId,
        CancellationToken cancellationToken)
    {
        return await personasContext.Medicos
            .AsNoTracking()
            .Include(x => x.Especialidades)
            .ThenInclude(x => x.Especialidad)
            .FirstOrDefaultAsync(x => x.EmpleadoId == empleadoId, cancellationToken);
    }

    private async Task EnsurePersonaExistsAsync(
        Guid personaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<Persona>()
            .AnyAsync(x => x.Id == personaId, cancellationToken);

        if (!exists)
            throw new BusinessException("La persona no existe.");
    }

    private async Task EnsurePersonaNotEmpleadoAsync(
        Guid personaId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Empleados
            .AnyAsync(x =>
                    x.PersonaId == personaId &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("La persona ya está registrada como empleado.");
    }

    private async Task EnsureRecursosHumanosExistAsync(
        CreateEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        if (!await context.Areas.AnyAsync(x => x.Id == request.AreaId, cancellationToken))
            throw new BusinessException("El área no existe.");

        if (!await context.Departamentos.AnyAsync(x => x.Id == request.DepartamentoId, cancellationToken))
            throw new BusinessException("El departamento no existe.");

        if (!await context.Servicios.AnyAsync(x => x.Id == request.ServicioId, cancellationToken))
            throw new BusinessException("El servicio no existe.");

        if (!await context.Profesiones.AnyAsync(x => x.Id == request.ProfesionId, cancellationToken))
            throw new BusinessException("La profesión no existe.");

        if (!await context.Cargos.AnyAsync(x => x.Id == request.CargoId, cancellationToken))
            throw new BusinessException("El cargo no existe.");
    }

    private async Task EnsureRecursosHumanosExistAsync(
        UpdateEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureRecursosHumanosExistAsync(
            new CreateEmpleadoRequest(
                request.PersonaId,
                request.CodigoEmpleado,
                request.AreaId,
                request.DepartamentoId,
                request.ServicioId,
                request.ProfesionId,
                request.CargoId,
                request.FechaIngreso,
                request.EsMedico,
                request.Medico),
            cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Empleados
            .AnyAsync(x =>
                    x.CodigoEmpleado == codigo &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código de empleado ya existe.");
    }

    private static EmpleadoResponse ToResponse(
        Empleado entity,
        Persona? persona,
        Medico? medico = null)
    {
        return new EmpleadoResponse(
            entity.Id,
            entity.PersonaId,
            persona is null ? string.Empty : NombreCompleto(persona),
            entity.CodigoEmpleado,
            entity.FechaIngreso,
            entity.AreaId,
            entity.Area.Nombre,
            entity.DepartamentoId,
            entity.Departamento.Nombre,
            entity.ServicioId,
            entity.Servicio.Nombre,
            entity.ProfesionId,
            entity.Profesion.Nombre,
            entity.CargoId,
            entity.Cargo.Nombre,
            medico is not null,
            medico is null ? null : ToMedicoResponse(medico));
    }

    private static EmpleadoMedicoResponse ToMedicoResponse(Medico medico)
    {
        var especialidades = medico.Especialidades
            .OrderByDescending(x => x.EsPrincipal)
            .ThenBy(x => x.Especialidad.Nombre)
            .Select(x => new EmpleadoMedicoEspecialidadResponse(
                x.EspecialidadId,
                x.Especialidad.Nombre,
                x.EsPrincipal))
            .ToList();

        var principal = especialidades.FirstOrDefault(x => x.EsPrincipal)
            ?? especialidades.FirstOrDefault();

        return new EmpleadoMedicoResponse(
            medico.Id,
            especialidades,
            principal?.EspecialidadId ?? Guid.Empty,
            medico.MatriculaProfesional,
            medico.RegistroColegioMedico);
    }

    private static string NombreCompleto(Persona persona) =>
        $"{persona.Nombres} {persona.ApellidoPaterno} {persona.ApellidoMaterno}".Trim();
}
