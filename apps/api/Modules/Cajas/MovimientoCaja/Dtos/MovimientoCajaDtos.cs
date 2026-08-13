using Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;

public abstract record MovimientoCajaRequest
{
    public required int TurnoCajaId { get; init; }
    public required TipoMovimientoCaja Tipo { get; init; }
    public required DateTime FechaHora { get; init; }
    public required decimal Monto { get; init; }
    public required string Concepto { get; init; }
    public string? Referencia { get; init; }
    public string? Observacion { get; init; }
}

public sealed record CreateMovimientoCajaRequest : MovimientoCajaRequest;

public sealed record UpdateMovimientoCajaRequest : MovimientoCajaRequest;

public sealed record MovimientoCajaResponse : AuditableResponse
{
    public int Id { get; init; }
    public TurnoCajaInfo? TurnoCaja { get; init; }
    public TipoMovimientoCaja Tipo { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal Monto { get; init; }
    public string Concepto { get; init; } = string.Empty;
    public string? Referencia { get; init; }
    public string? Observacion { get; init; }
}