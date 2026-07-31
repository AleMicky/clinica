using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class MovimientoAlmacenDetalle : AuditableEntity
{
    public Guid MovimientoAlmacenId { get; set; }
    public MovimientoAlmacen MovimientoAlmacen { get; set; } = null!;

    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public Guid? ProductoLoteId { get; set; }
    public ProductoLote? ProductoLote { get; set; }

    public decimal Cantidad { get; set; }

    public decimal CostoUnitario { get; set; }
    public decimal CostoTotal { get; set; }
}