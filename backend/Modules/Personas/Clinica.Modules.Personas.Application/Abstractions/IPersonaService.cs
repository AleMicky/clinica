using Clinica.Modules.Personas.Application.Personas;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Abstractions;

public interface IPersonaService : ICrudService<Guid,
    PersonaResponse,
    CreatePersonaRequest,
    UpdatePersonaRequest>
{
    Task<PagedResult<PersonaResponse>> GetPagedAsync(
        PersonaPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<Guid, PersonaResponse>> GetByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken = default);
}
