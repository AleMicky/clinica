using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
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

public sealed record CobroDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int CobroId { get; init; }
    public int MetodoPagoId { get; init; }
    public MetodoPagoInfo MetodoPago { get; init; } = null!;
    public int MonedaId { get; init; }
    public MonedaInfo Moneda { get; init; } = null!;
    public int? CuentaBancariaId { get; init; }
    public decimal Monto { get; init; }
    public decimal TipoCambio { get; init; }
    public decimal MontoMonedaBase { get; init; }
    public string? Referencia { get; init; }
    public string? EntidadFinanciera { get; init; }
    public string? Observacion { get; init; }
}
