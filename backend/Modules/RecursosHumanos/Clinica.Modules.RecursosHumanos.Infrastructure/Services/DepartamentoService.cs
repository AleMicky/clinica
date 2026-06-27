using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Departamentos;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
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
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Departamentos
            .AsNoTracking()
            .Include(x => x.Area)
            .AsQueryable();

        if (request.AreaId is { } areaId && areaId != Guid.Empty)
            query = query.Where(x => x.AreaId == areaId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<DepartamentoResponse>(items, total, page, pageSize);
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

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Departamento
        {
            AreaId = request.AreaId,
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            Descripcion = NormalizeOptional(request.Descripcion)
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

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.AreaId = request.AreaId;
        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Descripcion = NormalizeOptional(request.Descripcion);

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

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string value)
    {
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
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
