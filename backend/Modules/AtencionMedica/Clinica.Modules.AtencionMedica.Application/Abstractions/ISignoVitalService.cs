using Clinica.Modules.AtencionMedica.Application.SignosVitales;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface ISignoVitalService : ICrudService<Guid,
    SignoVitalResponse,
    CreateSignoVitalRequest,
    UpdateSignoVitalRequest>
{
    Task<PagedResult<SignoVitalResponse>> GetPagedAsync(
        SignoVitalPagedRequest request,
        CancellationToken cancellationToken = default);
}
