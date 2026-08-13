using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.Cobro.Dtos;

public record CobroDetalleRequest
{
    public required int MetodoPagoId { get; init; }
    public required int MonedaId { get; init; }
    public int? CuentaBancariaId { get; init; }
    public required decimal Monto { get; init; }
    public decimal TipoCambio { get; init; } = 1m;
    public string? Referencia { get; init; }
    public string? EntidadFinanciera { get; init; }
    public string? Observacion { get; init; }
}

public abstract record CobroRequest
{
    public required int TurnoCajaId { get; init; }
    public required int VentaPagadorId { get; init; }
    public required DateTime FechaHora { get; init; }
    public string? Observacion { get; init; }
    public required IReadOnlyCollection<CobroDetalleRequest> Detalles { get; init; }
}

public sealed record CreateCobroRequest : CobroRequest;

public sealed record UpdateCobroRequest : CobroRequest;

public sealed record AnularCobroRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record CobroResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;
    public TurnoCajaInfo? TurnoCaja { get; init; }
    public VentaPagadorInfo? VentaPagador { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal Total { get; init; }
    public EstadoCobro Estado { get; init; }
    public string? Observacion { get; init; }
    public string? MotivoAnulacion { get; init; }
    public DateTime? FechaHoraAnulacion { get; init; }
    public IReadOnlyCollection<CobroDetalleResponse> Detalles { get; init; } = [];
}

public sealed record CobroDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int CobroId { get; init; }
    public int MetodoPagoId { get; init; }
    public int MonedaId { get; init; }
    public int? CuentaBancariaId { get; init; }
    public decimal Monto { get; init; }
    public decimal TipoCambio { get; init; }
    public decimal MontoMonedaBase { get; init; }
    public string? Referencia { get; init; }
    public string? EntidadFinanciera { get; init; }
    public string? Observacion { get; init; }
}

public sealed record VentaPagadorInfo
{
    public int Id { get; init; }
    public TipoPagador Tipo { get; init; }
    public int VentaId { get; init; }
    public string VentaNumero { get; init; } = string.Empty;
    public int? ConvenioId { get; init; }
    public string? ConvenioNombre { get; init; }
    public decimal Monto { get; init; }
    public EstadoVentaPagador Estado { get; init; }
}