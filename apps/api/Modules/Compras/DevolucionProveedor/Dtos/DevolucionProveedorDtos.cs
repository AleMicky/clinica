using Clinica.Api.Modules.Compras.DevolucionProveedor.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Dtos;

public sealed record DevolucionProveedorDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal Cantidad { get; init; }
    public string? Motivo { get; init; }
    public string? Observacion { get; init; }
}

public abstract record DevolucionProveedorRequest
{
    public required int ProveedorId { get; init; }
    public required int AlmacenId { get; init; }
    public int? RecepcionCompraId { get; init; }
    public required DateTime Fecha { get; init; }
    public required string Motivo { get; init; }
    public string? Observacion { get; init; }

    public IReadOnlyCollection<DevolucionProveedorDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateDevolucionProveedorRequest : DevolucionProveedorRequest;

public sealed record UpdateDevolucionProveedorRequest : DevolucionProveedorRequest;

public sealed record AnularDevolucionProveedorRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record DevolucionProveedorDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal Cantidad { get; init; }
    public string? Motivo { get; init; }
    public string? Observacion { get; init; }
}

public sealed record DevolucionProveedorResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;

    public int ProveedorId { get; init; }
    public string? ProveedorRazonSocial { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public int? RecepcionCompraId { get; init; }
    public string? RecepcionCompraNumero { get; init; }

    public DateTime Fecha { get; init; }

    public EstadoDevolucionProveedor Estado { get; init; }

    public string Motivo { get; init; } = string.Empty;
    public string? Observacion { get; init; }
    public string? AutorizadoPorId { get; init; }
    public DateTime? FechaAutorizacion { get; init; }

    public int? MovimientoInventarioId { get; init; }

    public IReadOnlyCollection<DevolucionProveedorDetalleResponse> Detalles { get; init; } = [];
}
