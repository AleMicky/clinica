using Clinica.Modules.Personas.Application.ContactosEmergencia;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Abstractions;

public interface IContactoEmergenciaService : ICrudService<Guid,
    ContactoEmergenciaResponse,
    CreateContactoEmergenciaRequest,
    UpdateContactoEmergenciaRequest>
{
    Task<PagedResult<ContactoEmergenciaResponse>> GetPagedAsync(
        ContactoEmergenciaPagedRequest request,
        CancellationToken cancellationToken = default);
}
