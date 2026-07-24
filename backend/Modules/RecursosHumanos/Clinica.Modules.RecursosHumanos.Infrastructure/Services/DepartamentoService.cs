using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Departamentos;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class DepartamentoService(
    RecursosHumanosDbContext context
) : IDepartamentoService
{
    public Task<PagedResult<DepartamentoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new DepartamentoPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<DepartamentoResponse>> GetPagedAsync(
        DepartamentoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Departamentos
            .AsNoTracking()
            .Include(x => x.Area)
            .AsQueryable();

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.AreaId == areaId);

        return await query
            .OrderBy(x => x.Nombre)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<DepartamentoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Departamentos
            .AsNoTracking()
            .Include(x => x.Area)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<DepartamentoResponse> CreateAsync(
        CreateDepartamentoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAreaExistsAsync(request.AreaId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Departamento
        {
            AreaId = request.AreaId,
            Codigo = codigo,
            Nombre = StringNormalize.Required(request.Nombre),
            Descripcion = StringNormalize.Optional(request.Descripcion)
        };

        context.Departamentos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        var area = await context.Areas
            .AsNoTracking()
            .FirstAsync(x => x.Id == entity.AreaId, cancellationToken);

        return ToResponse(entity, area.Nombre);
    }

    public async Task<DepartamentoResponse> UpdateAsync(
        Guid id,
        UpdateDepartamentoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Departamentos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Departamento no encontrado.");

        await EnsureAreaExistsAsync(request.AreaId, cancellationToken);

        var codigo = StringNormalize.Required(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.AreaId = request.AreaId;
        entity.Codigo = codigo;
        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.Descripcion = StringNormalize.Optional(request.Descripcion);

        await context.SaveChangesAsync(cancellationToken);

        var area = await context.Areas
            .AsNoTracking()
            .FirstAsync(x => x.Id == entity.AreaId, cancellationToken);

        return ToResponse(entity, area.Nombre);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Departamentos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Departamento no encontrado.");

        context.Departamentos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAreaExistsAsync(
        Guid areaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Areas
            .AnyAsync(x => x.Id == areaId, cancellationToken);

        if (!exists)
            throw new BusinessException("El área no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Departamentos
            .AnyAsync(x =>
                    x.Codigo == codigo &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe.");
    }

    private static DepartamentoResponse ToResponse(Departamento entity)
    {
        return new DepartamentoResponse(
            entity.Id,
            entity.AreaId,
            entity.Area.Nombre,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty);
    }

    private static DepartamentoResponse ToResponse(Departamento entity, string areaNombre)
    {
        return new DepartamentoResponse(
            entity.Id,
            entity.AreaId,
            areaNombre,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty);
    }
}
