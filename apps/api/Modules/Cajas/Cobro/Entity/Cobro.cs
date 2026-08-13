using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.Cobro.Entity;

public sealed class Cobro : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int TurnoCajaId { get; set; }
    public TurnoCaja.Entity.TurnoCaja TurnoCaja { get; set; } = null!;

    public int VentaPagadorId { get; set; }
    public VentaPagador VentaPagador { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public decimal Total { get; set; }

    public EstadoCobro Estado { get; set; }

    public string? Observacion { get; set; }

    public string? MotivoAnulacion { get; set; }

    public DateTime? FechaHoraAnulacion { get; set; }

    public ICollection<CobroDetalle> Detalles { get; set; } = [];
}