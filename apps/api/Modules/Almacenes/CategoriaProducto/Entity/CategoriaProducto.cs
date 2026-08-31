using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity;

public sealed class CategoriaProducto : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public int? CategoriaPadreId { get; set; }
    public CategoriaProducto? CategoriaPadre { get; set; }

    public ICollection<CategoriaProducto> Subcategorias { get; set; } = [];
}