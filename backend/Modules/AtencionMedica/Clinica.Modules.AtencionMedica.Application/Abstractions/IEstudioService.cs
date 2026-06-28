using Clinica.Modules.AtencionMedica.Application.Estudios;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IEstudioService : ICrudService<Guid,
    EstudioResponse,
    CreateEstudioRequest,
    UpdateEstudioRequest>
{
    Task<PagedResult<EstudioResponse>> GetPagedAsync(
        EstudioPagedRequest request,
        CancellationToken cancellationToken = default);
}
