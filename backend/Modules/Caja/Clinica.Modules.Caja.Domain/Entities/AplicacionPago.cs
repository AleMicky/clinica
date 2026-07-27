using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class AplicacionPago : AuditableEntity
{
    public Guid PagoId { get; set; }
    public Pago Pago { get; set; } = null!;
    public Guid CuentaId { get; set; }
    public Cuenta Cuenta { get; set; } = null!;
    public decimal ImporteAplicado { get; set; }
}
