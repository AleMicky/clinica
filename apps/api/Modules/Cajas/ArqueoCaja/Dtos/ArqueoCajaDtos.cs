using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;

public sealed record ArqueoCajaDetalleRequest
{
    public required int MetodoPagoId { get; init; }

    public required int MonedaId { get; init; }

    public required decimal MontoContado { get; init; }
}

public sealed record RegistrarArqueoCajaRequest
{
    public required int TurnoCajaId { get; init; }

    public string? Observacion { get; init; }

    public required IReadOnlyCollection<ArqueoCajaDetalleRequest> Detalles { get; init; }
}

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

    public MetodoPagoInfo MetodoPago { get; init; } = null!;

    public int MonedaId { get; init; }

    public MonedaInfo Moneda { get; init; } = null!;

    public decimal MontoEsperado { get; init; }

    public decimal MontoContado { get; init; }

    public decimal Diferencia { get; init; }
}

public sealed record ArqueoCajaResumenResponse
{
    public int TurnoCajaId { get; init; }

    public decimal TotalEsperado { get; init; }

    public IReadOnlyCollection<ArqueoCajaResumenDetalleResponse> Detalles { get; init; } = [];
}

public sealed record ArqueoCajaResumenDetalleResponse
{
    public int MetodoPagoId { get; init; }

    public string MetodoPagoNombre { get; init; } = string.Empty;

    public int MonedaId { get; init; }

    public string MonedaNombre { get; init; } = string.Empty;

    public string MonedaSimbolo { get; init; } = string.Empty;

    public decimal MontoEsperado { get; init; }
}