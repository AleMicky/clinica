using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Inventarios;

public sealed record InventarioDetalleRequest(
    Guid ProductoId,
    decimal CantidadContada,
    Guid? ProductoLoteId = null,
    string? Observacion = null);

public sealed record CreateInventarioFisicoRequest(
    Guid AlmacenId,
    string? Observacion = null);

public sealed record ContarInventarioRequest(
    IReadOnlyList<InventarioDetalleRequest> Detalles);

public sealed record InventarioDetalleResponse(
    Guid Id,
    Guid ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    Guid? ProductoLoteId,
    string? LoteNumero,
    decimal CantidadSistema,
    decimal CantidadContada,
    decimal Diferencia,
    string? Observacion);

public sealed record InventarioFisicoResponse(
    Guid Id,
    string Numero,
    Guid AlmacenId,
    string AlmacenNombre,
    DateTime FechaInicio,
    DateTime? FechaFinalizacion,
    string Estado,
    string? Observacion,
    IReadOnlyList<InventarioDetalleResponse> Detalles);

public sealed record InventarioListItemResponse(
    Guid Id,
    string Numero,
    string AlmacenNombre,
    DateTime FechaInicio,
    string Estado);

public sealed class InventarioPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public string? Estado { get; set; }
}
