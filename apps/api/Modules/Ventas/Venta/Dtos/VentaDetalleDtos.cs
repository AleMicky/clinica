using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Ventas.Venta.Dtos;

public record VentaDetalleRequest
{
    public required int ServicioId { get; init; }

    public int? MedicoId { get; init; }

    public decimal Cantidad { get; init; } = 1m;

    public decimal PrecioUnitario { get; init; }

    public decimal Descuento { get; init; }
}

public sealed record CreateVentaDetalleRequest : VentaDetalleRequest;

public sealed record UpdateVentaDetalleRequest : VentaDetalleRequest;

public sealed record VentaDetalleResponse : AuditableResponse
{
    public int Id { get; init; }

    public int VentaId { get; init; }

    public int ServicioId { get; init; }

    public int? MedicoId { get; init; }

    public decimal Cantidad { get; init; }

    public decimal PrecioUnitario { get; init; }

    public decimal Descuento { get; init; }

    public decimal Total { get; init; }

    public decimal? MontoMedico { get; init; }

    public decimal? MontoClinica { get; init; }
}