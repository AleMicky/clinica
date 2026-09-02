using Clinica.Api.Modules.Almacenes.BajaInventario.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Dtos;

public sealed record BajaInventarioDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal Cantidad { get; init; }
    public string? Observacion { get; init; }
}

public abstract record BajaInventarioRequest
{
    public required int AlmacenId { get; init; }
    public required TipoBajaInventario Tipo { get; init; }
    public required DateTime Fecha { get; init; }
    public required string Motivo { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<BajaInventarioDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateBajaInventarioRequest : BajaInventarioRequest;

public sealed record UpdateBajaInventarioRequest : BajaInventarioRequest;

public sealed record AnularBajaInventarioRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record BajaInventarioDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal Cantidad { get; init; }
    public string? Observacion { get; init; }
}

public sealed record BajaInventarioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public TipoBajaInventario Tipo { get; init; }
    public DateTime Fecha { get; init; }
    public string Motivo { get; init; }
    public string? Observacion { get; init; }

    public EstadoBajaInventario Estado { get; init; }

    public int? MovimientoInventarioId { get; init; }

    public DateTime? FechaConfirmacion { get; init; }
    public DateTime? FechaAnulacion { get; init; }
    public string? MotivoAnulacion { get; init; }

    public IReadOnlyCollection<BajaInventarioDetalleResponse> Detalles { get; init; } = [];
}