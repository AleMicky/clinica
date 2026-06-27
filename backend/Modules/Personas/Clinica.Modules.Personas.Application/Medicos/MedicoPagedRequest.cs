using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Medicos;

public sealed class MedicoPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public Guid? EmpleadoId { get; init; }

    public Guid? EspecialidadId { get; init; }
}
