using Clinica.Api.Modules.Compras.CotizacionCompra.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Dtos;

public sealed record CotizacionCompraDetalleRequest
{
    public required int ProductoId { get; init; }
    public required decimal Cantidad { get; init; }
    public required decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public string? Observacion { get; init; }
}

public abstract record CotizacionCompraRequest
{
    public required int ProveedorId { get; init; }
    public int? SolicitudCompraId { get; init; }
    public required DateTime Fecha { get; init; }
    public DateTime? FechaVencimiento { get; init; }
    public string? CondicionPago { get; init; }
    public string? TiempoEntrega { get; init; }
    public string? Observacion { get; init; }

    public IReadOnlyCollection<CotizacionCompraDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateCotizacionCompraRequest : CotizacionCompraRequest;

public sealed record UpdateCotizacionCompraRequest : CotizacionCompraRequest;

public sealed record SeleccionarCotizacionCompraRequest;

public sealed record CancelarCotizacionCompraRequest
{
    public required string MotivoCancelacion { get; init; }
}

public sealed record CotizacionCompraDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }
    public decimal Cantidad { get; init; }
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public decimal Subtotal { get; init; }
    public string? Observacion { get; init; }
}

public sealed record CotizacionCompraResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;

    public int ProveedorId { get; init; }
    public string? ProveedorRazonSocial { get; init; }

    public int? SolicitudCompraId { get; init; }
    public string? SolicitudCompraNumero { get; init; }

    public DateTime Fecha { get; init; }
    public DateTime? FechaVencimiento { get; init; }

    public EstadoCotizacionCompra Estado { get; init; }

    public decimal Subtotal { get; init; }
    public decimal Descuento { get; init; }
    public decimal Impuesto { get; init; }
    public decimal Total { get; init; }

    public string? CondicionPago { get; init; }
    public string? TiempoEntrega { get; init; }
    public string? Observacion { get; init; }

    public IReadOnlyCollection<CotizacionCompraDetalleResponse> Detalles { get; init; } = [];
}
