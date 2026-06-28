using Clinica.Modules.AtencionMedica.Application.Diagnosticos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IDiagnosticoService : ICrudService<Guid,
    DiagnosticoResponse,
    CreateDiagnosticoRequest,
    UpdateDiagnosticoRequest>
{
    Task<PagedResult<DiagnosticoResponse>> GetPagedAsync(
        DiagnosticoPagedRequest request,
        CancellationToken cancellationToken = default);
}
