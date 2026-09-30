using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;


namespace Clinica.Api.Modules.Almacenes.Marca.Entity;

public sealed class Marca : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public ICollection<ProductoEntity> Productos { get; set; } = new List<ProductoEntity>();
}