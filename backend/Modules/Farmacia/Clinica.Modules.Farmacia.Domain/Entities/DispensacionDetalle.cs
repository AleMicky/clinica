using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Farmacia.Domain.Entities;

public class DispensacionDetalle : AuditableEntity
{
    public Guid DispensacionId { get; set; }
    public Dispensacion Dispensacion { get; set; } = null!;
    public Guid ProductoId { get; set; }
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public Guid? LoteId { get; set; }
}
