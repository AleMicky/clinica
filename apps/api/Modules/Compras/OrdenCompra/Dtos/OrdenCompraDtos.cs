using Clinica.Api.Modules.Compras.OrdenCompra.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.OrdenCompra.Dtos;

public sealed record OrdenCompraDetalleRequest
{
    public required int ProductoId { get; init; }
    public required decimal Cantidad { get; init; }
    public required decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public string? Observacion { get; init; }
}

public abstract record OrdenCompraRequest
{
    public required int ProveedorId { get; init; }
    public required int AlmacenId { get; init; }
    public int? SolicitudCompraId { get; init; }
    public int? CotizacionCompraId { get; init; }
    public required DateTime Fecha { get; init; }
    public DateTime? FechaEntregaEsperada { get; init; }
    public string? CondicionPago { get; init; }
    public string? Observacion { get; init; }

    public IReadOnlyCollection<OrdenCompraDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateOrdenCompraRequest : OrdenCompraRequest;

public sealed record UpdateOrdenCompraRequest : OrdenCompraRequest;

public sealed record RecibirOrdenCompraDetalleRequest
{
    public required int DetalleId { get; init; }
    public required decimal CantidadRecibida { get; init; }
}

public sealed record RecibirOrdenCompraRequest
{
    public IReadOnlyCollection<RecibirOrdenCompraDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CancelarOrdenCompraRequest
{
    public required string MotivoCancelacion { get; init; }
}

public sealed record OrdenCompraDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }
    public decimal Cantidad { get; init; }
    public decimal CantidadRecibida { get; init; }
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public decimal Subtotal { get; init; }
    public string? Observacion { get; init; }
}

public sealed record OrdenCompraResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;

    public int ProveedorId { get; init; }
    public string? ProveedorRazonSocial { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public int? SolicitudCompraId { get; init; }
    public string? SolicitudCompraNumero { get; init; }

    public int? CotizacionCompraId { get; init; }
    public string? CotizacionCompraNumero { get; init; }

    public DateTime Fecha { get; init; }
    public DateTime? FechaEntregaEsperada { get; init; }

    public EstadoOrdenCompra Estado { get; init; }

    public decimal Subtotal { get; init; }
    public decimal Descuento { get; init; }
    public decimal Impuesto { get; init; }
    public decimal Total { get; init; }

    public string? CondicionPago { get; init; }
    public string? Observacion { get; init; }
    public string? AprobadoPorId { get; init; }
    public DateTime? FechaAprobacion { get; init; }

    public IReadOnlyCollection<OrdenCompraDetalleResponse> Detalles { get; init; } = [];
}
