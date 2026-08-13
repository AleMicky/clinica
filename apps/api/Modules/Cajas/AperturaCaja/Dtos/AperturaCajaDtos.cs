using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.AperturaCaja.Dtos;

public abstract record AperturaCajaRequest
{
    public required int TurnoCajaId { get; init; }
    public required DateTime FechaHora { get; init; }
    public required decimal MontoInicial { get; init; }
    public string? Observacion { get; init; }
}

public sealed record CreateAperturaCajaRequest : AperturaCajaRequest;

public sealed record UpdateAperturaCajaRequest : AperturaCajaRequest;

public sealed record AperturaCajaResponse : AuditableResponse
{
    public int Id { get; init; }
    public TurnoCajaInfo? TurnoCaja { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal MontoInicial { get; init; }
    public string? Observacion { get; init; }
}