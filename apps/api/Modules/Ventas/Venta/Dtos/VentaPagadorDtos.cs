using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Ventas.Venta.Dtos;

public record VentaPagadorRequest
{
    public required TipoPagador Tipo { get; init; }
    public int? ConvenioId { get; init; }
    public required decimal Monto { get; init; }
}

public sealed record CreateVentaPagadorRequest : VentaPagadorRequest;

public sealed record UpdateVentaPagadorRequest : VentaPagadorRequest;

public sealed record VentaPagadorResponse : AuditableResponse
{
    public int Id { get; init; }
    public int VentaId { get; init; }
    public TipoPagador Tipo { get; init; }
    public int? ConvenioId { get; init; }
    public decimal Monto { get; init; }
    public EstadoVentaPagador Estado { get; init; }
}
