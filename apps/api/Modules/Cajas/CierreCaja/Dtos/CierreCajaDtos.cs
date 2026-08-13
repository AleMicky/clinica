using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.CierreCaja.Dtos;

public abstract record CierreCajaRequest
{
    public required int TurnoCajaId { get; init; }
    public required int ArqueoCajaId { get; init; }
    public required DateTime FechaHora { get; init; }
    public required decimal MontoApertura { get; init; }
    public required decimal TotalIngresos { get; init; }
    public required decimal TotalEgresos { get; init; }
    public required decimal TotalCobros { get; init; }
    public required decimal TotalEsperado { get; init; }
    public required decimal TotalContado { get; init; }
    public required decimal Diferencia { get; init; }
    public string? Observacion { get; init; }
}

public sealed record CreateCierreCajaRequest : CierreCajaRequest;

public sealed record UpdateCierreCajaRequest : CierreCajaRequest;

public sealed record CierreCajaResponse : AuditableResponse
{
    public int Id { get; init; }
    public TurnoCajaInfo? TurnoCaja { get; init; }
    public ArqueoCajaInfo? ArqueoCaja { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal MontoApertura { get; init; }
    public decimal TotalIngresos { get; init; }
    public decimal TotalEgresos { get; init; }
    public decimal TotalCobros { get; init; }
    public decimal TotalEsperado { get; init; }
    public decimal TotalContado { get; init; }
    public decimal Diferencia { get; init; }
    public string? Observacion { get; init; }
}

public sealed record ArqueoCajaInfo
{
    public int Id { get; init; }
    public DateTime FechaHora { get; init; }
    public decimal TotalEsperado { get; init; }
    public decimal TotalContado { get; init; }
    public decimal Diferencia { get; init; }
}