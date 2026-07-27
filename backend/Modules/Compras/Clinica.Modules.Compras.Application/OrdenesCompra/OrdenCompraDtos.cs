using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Compras.Application.OrdenesCompra;

public sealed record OrdenCompraDetalleRequest(Guid ProductoId, decimal Cantidad, decimal CostoUnitario);

public sealed record CreateOrdenCompraRequest(
    Guid ProveedorId,
    IReadOnlyList<OrdenCompraDetalleRequest> Detalles,
    string? Observaciones = null);

public sealed record RecibirOrdenLineaRequest(
    Guid DetalleId,
    decimal Cantidad,
    string NumeroLote,
    DateOnly? FechaVencimiento = null);

public sealed record RecibirOrdenRequest(IReadOnlyList<RecibirOrdenLineaRequest> Lineas);

public sealed record OrdenCompraDetalleResponse(
    Guid Id,
    Guid ProductoId,
    decimal Cantidad,
    decimal CostoUnitario,
    decimal CantidadRecibida);

public sealed record OrdenCompraResponse(
    Guid Id,
    string Numero,
    Guid ProveedorId,
    string ProveedorNombre,
    DateTime Fecha,
    string Estado,
    string? Observaciones,
    IReadOnlyList<OrdenCompraDetalleResponse> Detalles);

public sealed record OrdenCompraListItemResponse(
    Guid Id,
    string Numero,
    Guid ProveedorId,
    string ProveedorNombre,
    DateTime Fecha,
    string Estado);

public sealed class OrdenCompraPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public Guid? ProveedorId { get; set; }
    public string? Estado { get; set; }
}
