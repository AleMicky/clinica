using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.ContactosEmergencia;

public sealed class ContactoEmergenciaPagedRequest : PagedRequest
{
    public Guid? PersonaId { get; init; }

    public string? Search { get; init; }
}
