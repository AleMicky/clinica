using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Turnos;

public sealed class TurnoPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public bool? Activo { get; init; }
}
