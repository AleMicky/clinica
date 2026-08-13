using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;

public record ArqueoCajaDetalleRequest
{
    public required int MetodoPagoId { get; init; }
    public required int MonedaId { get; init; }
    public required decimal MontoEsperado { get; init; }
    public required decimal MontoContado { get; init; }
}

public abstract record ArqueoCajaRequest
{
    public required int TurnoCajaId { get; init; }
    public required DateTime FechaHora { get; init; }
    public string? Observacion { get; init; }
    public required IReadOnlyCollection<ArqueoCajaDetalleRequest> Detalles { get; init; }
}

public sealed record CreateArqueoCajaRequest : ArqueoCajaRequest;

public sealed record UpdateArqueoCajaRequest : ArqueoCajaRequest;

public sealed record ArqueoCajaResponse : AuditableResponse
{
    public int Id { get; init; }
    public TurnoCajaInfo? TurnoCaja { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal TotalEsperado { get; init; }
    public decimal TotalContado { get; init; }
    public decimal Diferencia { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<ArqueoCajaDetalleResponse> Detalles { get; init; } = [];
}

public sealed record ArqueoCajaDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int ArqueoCajaId { get; init; }
    public int MetodoPagoId { get; init; }
    public int MonedaId { get; init; }
    public decimal MontoEsperado { get; init; }
    public decimal MontoContado { get; init; }
    public decimal Diferencia { get; init; }
}