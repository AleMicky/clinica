using Clinica.Api.Modules.Almacenes.MovimientoInventario.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;

public sealed record MovimientoInventarioDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal Cantidad { get; init; }
    public decimal? CostoUnitario { get; init; }
}

public abstract record MovimientoInventarioRequest
{
    public required string Numero { get; init; }
    public required int TipoMovimientoInventarioId { get; init; }
    public required int AlmacenId { get; init; }
    public required DateTime FechaMovimiento { get; init; }

    public string? ReferenciaTipo { get; init; }
    public int? ReferenciaId { get; init; }

    public string? Observacion { get; init; }

    public IReadOnlyCollection<MovimientoInventarioDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateMovimientoInventarioRequest : MovimientoInventarioRequest;

public sealed record UpdateMovimientoInventarioRequest : MovimientoInventarioRequest;

public sealed record AnularMovimientoInventarioRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record MovimientoInventarioDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal Cantidad { get; init; }
    public decimal? CostoUnitario { get; init; }
    public decimal CostoTotal { get; init; }
}

public sealed record MovimientoInventarioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int TipoMovimientoInventarioId { get; init; }
    public string? TipoMovimientoNombre { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public DateTime FechaMovimiento { get; init; }

    public EstadoMovimientoInventario Estado { get; init; }

    public string? ReferenciaTipo { get; init; }
    public int? ReferenciaId { get; init; }

    public string? Observacion { get; init; }

    public DateTime? FechaConfirmacion { get; init; }
    public DateTime? FechaAnulacion { get; init; }
    public string? MotivoAnulacion { get; init; }

    public IReadOnlyCollection<MovimientoInventarioDetalleResponse> Detalles { get; init; } = [];
}
