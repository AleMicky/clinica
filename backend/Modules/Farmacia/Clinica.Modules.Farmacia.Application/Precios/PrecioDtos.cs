using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Farmacia.Application.Precios;

public sealed record PrecioResponse(Guid Id, Guid ProductoId, decimal Importe, DateOnly FechaInicio, DateOnly? FechaFin, string MotivoCambio);
public sealed record CreatePrecioRequest(Guid ProductoId, decimal Importe, DateOnly FechaInicio, DateOnly? FechaFin = null, string MotivoCambio = "");
public sealed record UpdatePrecioRequest(decimal Importe, DateOnly FechaInicio, DateOnly? FechaFin, string MotivoCambio);

public sealed class PrecioPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public Guid? ProductoId { get; set; }
}
