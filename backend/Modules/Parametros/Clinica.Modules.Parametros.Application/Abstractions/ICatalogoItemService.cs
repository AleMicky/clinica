using Clinica.Modules.Parametros.Application.CatalogoItems;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Parametros.Application.Abstractions;

public interface ICatalogoItemService : ICrudService<Guid,
    CatalogoItemResponse,
    CreateCatalogoItemRequest,
    UpdateCatalogoItemRequest>
{
    Task<PagedResult<CatalogoItemResponse>> GetPagedAsync(
        CatalogoItemPagedRequest request,
        CancellationToken cancellationToken = default);
}
