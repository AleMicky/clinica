using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IAtencionService : ICrudService<Guid,
    AtencionResponse,
    CreateAtencionRequest,
    UpdateAtencionRequest>
{
    Task<PagedResult<AtencionResponse>> GetPagedAsync(
        AtencionPagedRequest request,
        CancellationToken cancellationToken = default);
}
