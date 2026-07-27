using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class MovimientoDetalle : AuditableEntity
{
    public Guid MovimientoId { get; set; }
    public Movimiento Movimiento { get; set; } = null!;
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;
    public Guid? LoteId { get; set; }
    public Lote? Lote { get; set; }
    public decimal Cantidad { get; set; }
    public decimal? CostoUnitario { get; set; }
}
