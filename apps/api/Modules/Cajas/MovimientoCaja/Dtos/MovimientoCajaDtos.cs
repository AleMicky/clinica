using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;

public sealed record RegistrarMovimientoCajaRequest
{
    public required int TurnoCajaId { get; init; }

    public required int TipoMovimientoCajaId { get; init; }

    public required int ConceptoMovimientoCajaId { get; init; }

    public required int MonedaId { get; init; }

    public required decimal Monto { get; init; }

    public decimal TipoCambio { get; init; } = 1m;

    public string? Referencia { get; init; }

    public string? Observacion { get; init; }
}

public sealed record TipoMovimientoCajaInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string Naturaleza { get; init; } = string.Empty;
}

public sealed record ConceptoMovimientoCajaInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}

public sealed record MovimientoCajaResponse : AuditableResponse
{
    public int Id { get; init; }

    public TurnoCajaInfo? TurnoCaja { get; init; }

    public int TipoMovimientoCajaId { get; init; }
    public TipoMovimientoCajaInfo TipoMovimientoCaja { get; init; } = null!;

    public int ConceptoMovimientoCajaId { get; init; }
    public ConceptoMovimientoCajaInfo ConceptoMovimientoCaja { get; init; } = null!;

    public DateTime FechaHora { get; init; }

    public int MonedaId { get; init; }
    public MonedaInfo Moneda { get; init; } = null!;

    public decimal Monto { get; init; }

    public decimal TipoCambio { get; init; }

    public decimal MontoMonedaBase { get; init; }

    public string NaturalezaAplicada { get; init; } = string.Empty;

    public string? Referencia { get; init; }

    public string? Observacion { get; init; }
}