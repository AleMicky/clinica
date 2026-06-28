using Clinica.Modules.AtencionMedica.Application.ResultadosEstudio;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IResultadoEstudioService : ICrudService<Guid,
    ResultadoEstudioResponse,
    CreateResultadoEstudioRequest,
    UpdateResultadoEstudioRequest>
{
    Task<PagedResult<ResultadoEstudioResponse>> GetPagedAsync(
        ResultadoEstudioPagedRequest request,
        CancellationToken cancellationToken = default);
}
