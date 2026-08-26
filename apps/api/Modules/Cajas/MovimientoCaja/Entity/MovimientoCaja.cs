using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;

public sealed class MovimientoCaja : AuditableEntity
{
    public int TurnoCajaId { get; set; }

    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public TipoMovimientoCaja Tipo { get; set; }

    public DateTime FechaHora { get; set; }

    public int MonedaId { get; set; }

    public Moneda Moneda { get; set; } = null!;

    public decimal Monto { get; set; }

    public decimal TipoCambio { get; set; } = 1m;

    public decimal MontoMonedaBase { get; set; }

    public string Concepto { get; set; } = string.Empty;

    public string? Referencia { get; set; }

    public string? Observacion { get; set; }
}