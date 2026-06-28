using Clinica.Modules.AtencionMedica.Application.FormularioSecciones;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IFormularioSeccionService : ICrudService<Guid,
    FormularioSeccionResponse,
    CreateFormularioSeccionRequest,
    UpdateFormularioSeccionRequest>
{
    Task<PagedResult<FormularioSeccionResponse>> GetPagedAsync(
        FormularioSeccionPagedRequest request,
        CancellationToken cancellationToken = default);
}
