using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;

public sealed record RegistrarMovimientoCajaRequest
{
    public required int TurnoCajaId { get; init; }

    public required TipoMovimientoCaja Tipo { get; init; }

    public required int MonedaId { get; init; }

    public required decimal Monto { get; init; }

    public decimal TipoCambio { get; init; } = 1m;

    public required string Concepto { get; init; }

    public string? Referencia { get; init; }

    public string? Observacion { get; init; }
}

public sealed record MovimientoCajaResponse : AuditableResponse
{
    public int Id { get; init; }

    public TurnoCajaInfo? TurnoCaja { get; init; }

    public TipoMovimientoCaja Tipo { get; init; }

    public DateTime FechaHora { get; init; }

    public int MonedaId { get; init; }

    public MonedaInfo Moneda { get; init; } = null!;

    public decimal Monto { get; init; }

    public decimal TipoCambio { get; init; }

    public decimal MontoMonedaBase { get; init; }

    public string Concepto { get; init; } = string.Empty;

    public string? Referencia { get; init; }

    public string? Observacion { get; init; }
}