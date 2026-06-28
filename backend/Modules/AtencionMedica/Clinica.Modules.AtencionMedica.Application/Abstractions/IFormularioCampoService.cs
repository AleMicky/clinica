using Clinica.Modules.AtencionMedica.Application.FormularioCampos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IFormularioCampoService : ICrudService<Guid,
    FormularioCampoResponse,
    CreateFormularioCampoRequest,
    UpdateFormularioCampoRequest>
{
    Task<PagedResult<FormularioCampoResponse>> GetPagedAsync(
        FormularioCampoPagedRequest request,
        CancellationToken cancellationToken = default);
}
