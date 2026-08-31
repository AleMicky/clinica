namespace Clinica.Api.Shared.Crud;

public interface IEntityValidator
{
    Task EnsureExistsAsync<TEntity>(
        IQueryable<TEntity> query,
        int id,
        CancellationToken cancellationToken = default)
        where TEntity : class;

    Task EnsureActiveAsync<TEntity>(
        IQueryable<TEntity> query,
        int id,
        CancellationToken cancellationToken = default)
        where TEntity : class;
}