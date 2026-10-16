using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.PartidaInventario.Entity;

public sealed class PartidaInventario : AuditableEntity
{
    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public string? NumeroPartida { get; set; }

    public DateOnly? FechaVencimiento { get; set; }

    public decimal CostoUnitario { get; set; }
}