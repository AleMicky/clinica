using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Personas;

public sealed class PersonaPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public Guid? TipoDocumentoId { get; init; }
}
