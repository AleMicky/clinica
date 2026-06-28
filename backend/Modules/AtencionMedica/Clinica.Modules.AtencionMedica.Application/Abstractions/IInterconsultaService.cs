using Clinica.Modules.AtencionMedica.Application.Interconsultas;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IInterconsultaService : ICrudService<Guid,
    InterconsultaResponse,
    CreateInterconsultaRequest,
    UpdateInterconsultaRequest>
{
    Task<PagedResult<InterconsultaResponse>> GetPagedAsync(
        InterconsultaPagedRequest request,
        CancellationToken cancellationToken = default);
}
