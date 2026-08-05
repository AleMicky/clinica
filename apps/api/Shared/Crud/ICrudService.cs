using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Shared.Crud;

public interface ICrudService<TEntity> where TEntity : class
{
    Task<PagedResult<TEntity>> ListarAsync(
        PaginationRequest pagination,
        CancellationToken cancellationToken);

    Task<TEntity> ObtenerAsync(
        int id,
        CancellationToken cancellationToken);

    Task<TEntity> CrearAsync(
        TEntity entity,
        CancellationToken cancellationToken);

    Task<TEntity> ActualizarAsync(
        int id,
        TEntity entity,
        CancellationToken cancellationToken);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken);
}