using Clinica.Modules.AtencionMedica.Application.DiagnosticoAtenciones;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IDiagnosticoAtencionService : ICrudService<Guid,
    DiagnosticoAtencionResponse,
    CreateDiagnosticoAtencionRequest,
    UpdateDiagnosticoAtencionRequest>
{
    Task<PagedResult<DiagnosticoAtencionResponse>> GetPagedAsync(
        DiagnosticoAtencionPagedRequest request,
        CancellationToken cancellationToken = default);
}
