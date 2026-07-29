using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Programacion;

public sealed class ProgramacionPagedRequest : PagedRequest
{
    public string? Search { get; init; }

    public Guid? GrupoProgramacionId { get; init; }

    public int? Estado { get; init; }

    public DateOnly? FechaDesde { get; init; }

    public DateOnly? FechaHasta { get; init; }
}
