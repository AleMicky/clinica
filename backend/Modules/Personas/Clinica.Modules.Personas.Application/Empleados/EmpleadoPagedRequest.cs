using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Personas.Application.Empleados;

public sealed class EmpleadoPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public Guid? PersonaId { get; init; }

    public Guid? AreaId { get; init; }

    public Guid? DepartamentoId { get; init; }

    public Guid? ServicioId { get; init; }
}
