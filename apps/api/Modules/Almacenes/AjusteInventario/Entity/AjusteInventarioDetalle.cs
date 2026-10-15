using Clinica.Api.Shared.Abstractions;
using AjusteEntity = Clinica.Api.Modules.Almacenes.AjusteInventario.Entity.AjusteInventario;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Entity;

public sealed class AjusteInventarioDetalle : AuditableEntity
{
    public int AjusteInventarioId { get; set; }

    public AjusteEntity AjusteInventario { get; set; } = null!;

    public int ProductoId { get; set; }

    public ProductoEntity Producto { get; set; } = null!;

    public decimal Cantidad { get; set; }
}