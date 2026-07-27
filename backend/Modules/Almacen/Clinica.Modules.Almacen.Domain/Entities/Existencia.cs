using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class Existencia : AuditableEntity
{
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;
    public Guid LoteId { get; set; }
    public Lote Lote { get; set; } = null!;
    public decimal Cantidad { get; set; }
}
