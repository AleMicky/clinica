using Clinica.Modules.Laboratorio.Application.PruebaPrecios;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IPruebaPrecioService : ICrudService<Guid,
    PruebaPrecioResponse,
    CreatePruebaPrecioRequest,
    UpdatePruebaPrecioRequest>
{
    Task<PagedResult<PruebaPrecioResponse>> GetPagedAsync(
        PruebaPrecioPagedRequest request,
        CancellationToken cancellationToken = default);
}
