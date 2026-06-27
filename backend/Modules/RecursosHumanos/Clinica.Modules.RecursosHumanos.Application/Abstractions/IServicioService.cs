using Clinica.Modules.RecursosHumanos.Application.Servicios;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface IServicioService : ICrudService<Guid,
    ServicioResponse,
    CreateServicioRequest,
    UpdateServicioRequest>
{
    Task<PagedResult<ServicioResponse>> GetPagedAsync(
        ServicioPagedRequest request,
        CancellationToken cancellationToken = default);
}
