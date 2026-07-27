using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class PagoDetalle : AuditableEntity
{
    public Guid PagoId { get; set; }
    public Pago Pago { get; set; } = null!;
    public Guid MetodoPagoId { get; set; }
    public MetodoPago MetodoPago { get; set; } = null!;
    public decimal Importe { get; set; }
    public string? NumeroReferencia { get; set; }
    public string? Observaciones { get; set; }
}
