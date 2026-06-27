using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed class PacientePagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public Guid? PersonaId { get; init; }
}
