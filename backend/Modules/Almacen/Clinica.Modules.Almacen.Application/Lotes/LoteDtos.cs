using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Lotes;

public sealed record LoteResponse(
    Guid Id,
    Guid ProductoId,
    string ProductoNombre,
    string Numero,
    DateOnly? FechaVencimiento,
    DateTime FechaIngreso,
    Guid? ProveedorId,
    decimal Cantidad);

public sealed class LotePagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public Guid? ProductoId { get; set; }
}
