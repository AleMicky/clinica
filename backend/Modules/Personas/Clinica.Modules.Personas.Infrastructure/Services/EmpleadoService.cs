using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Empleados;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Services;

public sealed class EmpleadoService(
    PersonasDbContext context
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
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Empleados
            .AsNoTracking()
            .Include(x => x.Persona)
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

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.CodigoEmpleado.Contains(search) ||
                x.Persona.Nombres.Contains(search) ||
                x.Persona.ApellidoPaterno.Contains(search) ||
                x.Persona.ApellidoMaterno.Contains(search) ||
                x.Persona.NumeroDocumento.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.CodigoEmpleado)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<EmpleadoResponse>(items, total, page, pageSize);
    }

    public async Task<EmpleadoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Empleados
            .AsNoTracking()
            .Include(x => x.Persona)
            .Include(x => x.Area)
            .Include(x => x.Departamento)
            .Include(x => x.Servicio)
            .Include(x => x.Profesion)
            .Include(x => x.Cargo)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<EmpleadoResponse> CreateAsync(
        CreateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);
        await EnsurePersonaNotEmpleadoAsync(request.PersonaId, null, cancellationToken);
        await EnsureRecursosHumanosExistAsync(request, cancellationToken);

        var codigo = Normalize(request.CodigoEmpleado);
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

        var codigo = Normalize(request.CodigoEmpleado);
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

        var hasMedico = await context.Medicos
            .AnyAsync(x => x.EmpleadoId == id, cancellationToken);

        if (hasMedico)
            throw new BusinessException("No se puede eliminar un empleado que está registrado como médico.");

        context.Empleados.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePersonaExistsAsync(
        Guid personaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Personas
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
        if (!await context.Set<Area>().AnyAsync(x => x.Id == request.AreaId, cancellationToken))
            throw new BusinessException("El área no existe.");

        if (!await context.Set<Departamento>().AnyAsync(x => x.Id == request.DepartamentoId, cancellationToken))
            throw new BusinessException("El departamento no existe.");

        if (!await context.Set<Servicio>().AnyAsync(x => x.Id == request.ServicioId, cancellationToken))
            throw new BusinessException("El servicio no existe.");

        if (!await context.Set<Profesion>().AnyAsync(x => x.Id == request.ProfesionId, cancellationToken))
            throw new BusinessException("La profesión no existe.");

        if (!await context.Set<Cargo>().AnyAsync(x => x.Id == request.CargoId, cancellationToken))
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
                request.FechaIngreso),
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

    private static string Normalize(string value) => value.Trim();

    private static EmpleadoResponse ToResponse(Empleado entity)
    {
        return new EmpleadoResponse(
            entity.Id,
            entity.PersonaId,
            PersonaNaming.NombreCompleto(entity.Persona),
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
            entity.Cargo.Nombre);
    }
}
