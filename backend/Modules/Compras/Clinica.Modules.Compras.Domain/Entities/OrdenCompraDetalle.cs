using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Compras.Domain.Entities;

public class OrdenCompraDetalle : AuditableEntity
{
    public Guid OrdenCompraId { get; set; }
    public OrdenCompra OrdenCompra { get; set; } = null!;
    public Guid ProductoId { get; set; }
    public decimal Cantidad { get; set; }
    public decimal CostoUnitario { get; set; }
    public decimal CantidadRecibida { get; set; }
}
