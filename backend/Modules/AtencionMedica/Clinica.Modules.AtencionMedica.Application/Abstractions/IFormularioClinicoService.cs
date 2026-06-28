using Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IFormularioClinicoService : ICrudService<Guid,
    FormularioClinicoResponse,
    CreateFormularioClinicoRequest,
    UpdateFormularioClinicoRequest>
{
    Task<PagedResult<FormularioClinicoResponse>> GetPagedAsync(
        FormularioClinicoPagedRequest request,
        CancellationToken cancellationToken = default);
}
