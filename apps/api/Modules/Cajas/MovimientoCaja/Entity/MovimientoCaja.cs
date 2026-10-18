using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Abstractions;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;

public sealed class MovimientoCaja : AuditableEntity
{
    // Turno donde se registra el movimiento
    public int TurnoCajaId { get; set; }
    public TurnoCajaEntity TurnoCaja { get; set; } = null!;

    // Clasificación del movimiento
    public int TipoMovimientoCajaId { get; set; }
    public TipoMovimientoCaja TipoMovimientoCaja { get; set; } = null!;

    // Motivo del movimiento
    public int ConceptoMovimientoCajaId { get; set; }
    public ConceptoMovimientoCaja ConceptoMovimientoCaja { get; set; } = null!;

    // Fecha
    public DateTime FechaHora { get; set; }

    // Moneda
    public int MonedaId { get; set; }
    public Moneda Moneda { get; set; } = null!;

    // Importes
    public decimal Monto { get; set; }
    public decimal TipoCambio { get; set; } = 1m;
    public decimal MontoMonedaBase { get; set; }

    // ENTRADA o SALIDA
    public string NaturalezaAplicada { get; set; } = string.Empty;

    // Información complementaria
    public string? Referencia { get; set; }
    public string? Observacion { get; set; }
}