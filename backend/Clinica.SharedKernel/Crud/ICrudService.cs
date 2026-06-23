using Clinica.SharedKernel.Pagination;

namespace Clinica.SharedKernel.Crud;

public interface ICrudService<TKey, TResponse, in TCreateRequest, in TUpdateRequest>
    where TKey : notnull
{
    Task<PagedResult<TResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default);

    Task<TResponse?> GetByIdAsync(
        TKey id,
        CancellationToken cancellationToken = default);

    Task<TResponse> CreateAsync(
        TCreateRequest request,
        CancellationToken cancellationToken = default);

    Task<TResponse> UpdateAsync(
        TKey id,
        TUpdateRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        TKey id,
        CancellationToken cancellationToken = default);
}