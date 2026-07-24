using System.Linq.Expressions;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.SharedKernel.Crud;

/// <summary>
/// CRUD genérico para catálogos Código/Nombre/Descripción.
/// </summary>
public abstract class SimpleCatalogService<TEntity, TResponse, TCreateRequest, TUpdateRequest>(
    DbContext context
) : ICrudService<Guid, TResponse, TCreateRequest, TUpdateRequest>
    where TEntity : Entity, INamedCatalogEntity, new()
{
    protected DbContext Context => context;

    protected abstract DbSet<TEntity> Set { get; }

    protected abstract string NotFoundMessage { get; }

    protected virtual string DuplicateCodigoMessage => "El código ya existe.";

    protected abstract Expression<Func<TEntity, TResponse>> ProjectToResponse { get; }

    protected abstract TResponse MapToResponse(TEntity entity);

    protected abstract (string Codigo, string Nombre, string? Descripcion) ReadCreate(TCreateRequest request);

    protected abstract (string Codigo, string Nombre, string? Descripcion) ReadUpdate(TUpdateRequest request);

    public virtual async Task<PagedResult<TResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .OrderBy(x => x.Nombre)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public virtual async Task<TResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public virtual async Task<TResponse> CreateAsync(
        TCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var (codigo, nombre, descripcion) = NormalizeFields(ReadCreate(request));
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new TEntity();
        ApplyFields(entity, codigo, nombre, descripcion);

        Set.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public virtual async Task<TResponse> UpdateAsync(
        Guid id,
        TUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Set.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        var (codigo, nombre, descripcion) = NormalizeFields(ReadUpdate(request));
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        ApplyFields(entity, codigo, nombre, descripcion);
        await context.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public virtual async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Set.GetRequiredAsync(id, NotFoundMessage, cancellationToken);

        await OnBeforeDeleteAsync(entity, cancellationToken);

        Set.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    protected virtual Task OnBeforeDeleteAsync(
        TEntity entity,
        CancellationToken cancellationToken) =>
        Task.CompletedTask;

    protected virtual void ApplyFields(
        TEntity entity,
        string codigo,
        string nombre,
        string? descripcion)
    {
        entity.Codigo = codigo;
        entity.Nombre = nombre;
        entity.Descripcion = descripcion;
    }

    protected static (string Codigo, string Nombre, string? Descripcion) NormalizeFields(
        (string Codigo, string Nombre, string? Descripcion) fields) =>
        (
            StringNormalize.Required(fields.Codigo),
            StringNormalize.Required(fields.Nombre),
            StringNormalize.Optional(fields.Descripcion)
        );

    protected async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        await Set.EnsureUniqueAsync(
            EntityQueryExtensions.UniqueCodigoPredicate<TEntity>(codigo, currentId),
            DuplicateCodigoMessage,
            cancellationToken);
    }
}
