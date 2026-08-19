using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Cajas.Cobro.Enums;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Dtos;

public abstract record DevolucionCobroRequest
{
    public required int CobroId { get; init; }
    public required int TurnoCajaId { get; init; }
    public required DateTime FechaHora { get; init; }
    public required decimal Monto { get; init; }
    public required string Motivo { get; init; }
}

public sealed record CreateDevolucionCobroRequest : DevolucionCobroRequest;

public sealed record UpdateDevolucionCobroRequest : DevolucionCobroRequest;

public sealed record DevolucionCobroResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;
    public CobroInfo? Cobro { get; init; }
    public TurnoCajaInfo? TurnoCaja { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal Monto { get; init; }
    public string Motivo { get; init; } = string.Empty;
}

public sealed record CobroInfo
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;
    public DateTime FechaHora { get; init; }
    public decimal Total { get; init; }
    public EstadoCobro Estado { get; init; }
}