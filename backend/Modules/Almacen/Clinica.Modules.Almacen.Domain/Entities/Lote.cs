using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class Lote : AuditableEntity
{
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;
    public string Numero { get; set; } = string.Empty;
    public DateOnly? FechaVencimiento { get; set; }
    public DateTime FechaIngreso { get; set; }
    public Guid? ProveedorId { get; set; }
    public Existencia? Existencia { get; set; }
}
