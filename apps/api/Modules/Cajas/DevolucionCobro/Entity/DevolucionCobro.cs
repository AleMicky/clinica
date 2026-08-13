using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Entity;

public sealed class DevolucionCobro : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int CobroId { get; set; }
    public Cobro.Entity.Cobro Cobro { get; set; } = null!;

    public int TurnoCajaId { get; set; }
    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public decimal Monto { get; set; }

    public string Motivo { get; set; } = string.Empty;
}