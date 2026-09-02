using Clinica.Api.Modules.Compras.RecepcionCompra.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Dtos;

public sealed record RecepcionCompraDetalleRequest
{
    public required int OrdenCompraDetalleId { get; init; }
    public required decimal CantidadRecibida { get; init; }
    public int? LoteId { get; init; }
    public required decimal PrecioUnitario { get; init; }
    public string? Observacion { get; init; }
}

public abstract record RecepcionCompraRequest
{
    public required int OrdenCompraId { get; init; }
    public required int AlmacenId { get; init; }
    public required DateTime FechaRecepcion { get; init; }
    public string? NumeroFactura { get; init; }
    public string? NumeroRemision { get; init; }
    public string? Observacion { get; init; }

    public IReadOnlyCollection<RecepcionCompraDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateRecepcionCompraRequest : RecepcionCompraRequest;

public sealed record UpdateRecepcionCompraRequest : RecepcionCompraRequest;

public sealed record AnularRecepcionCompraRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record RecepcionCompraDetalleResponse
{
    public int Id { get; init; }
    public int OrdenCompraDetalleId { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal CantidadRecibida { get; init; }
    public decimal PrecioUnitario { get; init; }
    public string? Observacion { get; init; }
}

public sealed record RecepcionCompraResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;

    public int OrdenCompraId { get; init; }
    public string? OrdenCompraNumero { get; init; }

    public int ProveedorId { get; init; }
    public string? ProveedorRazonSocial { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public DateTime FechaRecepcion { get; init; }

    public EstadoRecepcionCompra Estado { get; init; }

    public string? NumeroFactura { get; init; }
    public string? NumeroRemision { get; init; }
    public string? RecibidoPorId { get; init; }
    public string? Observacion { get; init; }

    public int? MovimientoInventarioId { get; init; }

    public IReadOnlyCollection<RecepcionCompraDetalleResponse> Detalles { get; init; } = [];
}
