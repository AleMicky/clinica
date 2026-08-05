using Clinica.Api.Data;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Shared.Crud;

public abstract class CrudService<
    TEntity,
    TCreateRequest,
    TUpdateRequest,
    TResponse>(
    AppDbContext dbContext)
    where TEntity : AuditableEntity
{
    protected AppDbContext DbContext { get; } = dbContext;

    protected DbSet<TEntity> Entities =>
        DbContext.Set<TEntity>();

    protected virtual IQueryable<TEntity> BuildQuery()
    {
        return Entities;
    }

    protected virtual IQueryable<TEntity> ApplyOrder(
        IQueryable<TEntity> query)
    {
        return query.OrderBy(x => x.Id);
    }

    public virtual async Task<PagedResult<TResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        query = ApplySearch(query, normalizedSearch);

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1)
                     * pagination.ValidPageSize;

        var entities = await ApplyOrder(query)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }
    public virtual async Task<TResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity);
    }

    public virtual async Task<TResponse> CrearAsync(
        TCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateCreateAsync(request, cancellationToken);

        var entity = MapToNewEntity(request);

        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public virtual async Task<TResponse> ActualizarAsync(
        int id,
        TUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidateUpdateAsync(
            id,
            request,
            entity,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public virtual async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidateDeleteAsync(entity, cancellationToken);

        entity.Activo = false;

        await DbContext.SaveChangesAsync(cancellationToken);
    }

    protected virtual Task ValidateCreateAsync(
        TCreateRequest request,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    protected virtual Task ValidateUpdateAsync(
        int id,
        TUpdateRequest request,
        TEntity entity,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    protected virtual Task ValidateDeleteAsync(
        TEntity entity,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    protected virtual NotFoundException CreateNotFoundException(int id)
    {
        return new NotFoundException(typeof(TEntity).Name, id);
    }
    protected virtual IQueryable<TEntity> ApplySearch(
        IQueryable<TEntity> query,
        string? search)
    {
        return query;
    }

    protected abstract TEntity MapToNewEntity(TCreateRequest request);
    protected abstract void MapToExistingEntity(TUpdateRequest request, TEntity entity);
    protected abstract TResponse MapToResponse(TEntity entity);
    protected abstract IReadOnlyCollection<TResponse> MapToResponseList(IEnumerable<TEntity> entities);
}