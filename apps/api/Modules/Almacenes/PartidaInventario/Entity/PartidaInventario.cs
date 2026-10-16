using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Producto.Entity;

public sealed class PartidaInventario : AuditableEntity
{
    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public DateOnly? FechaVencimiento { get; set; }

    public decimal CostoUnitario { get; set; }
}