using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Entity;

public sealed class DevolucionCobro : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int CobroId { get; set; }
    public Cobro.Entity.Cobro Cobro { get; set; } = null!;

    public int TurnoCajaId { get; set; }
    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public int MetodoPagoId { get; set; }
    public MetodoPago MetodoPago { get; set; } = null!;

    public int MonedaId { get; set; }
    public Moneda Moneda { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public decimal Monto { get; set; }

    public string Motivo { get; set; } = string.Empty;
}