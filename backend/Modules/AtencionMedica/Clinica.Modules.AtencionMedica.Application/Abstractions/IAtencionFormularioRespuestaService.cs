using Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IAtencionFormularioRespuestaService : ICrudService<Guid,
    AtencionFormularioRespuestaResponse,
    CreateAtencionFormularioRespuestaRequest,
    UpdateAtencionFormularioRespuestaRequest>
{
    Task<PagedResult<AtencionFormularioRespuestaResponse>> GetPagedAsync(
        AtencionFormularioRespuestaPagedRequest request,
        CancellationToken cancellationToken = default);
}
