using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class CatalogoGrupo : AuditableEntity, INamedCatalogEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public ICollection<CatalogoItem> Items { get; set; } = [];

    string? INamedCatalogEntity.Descripcion
    {
        get => Descripcion;
        set => Descripcion = value ?? string.Empty;
    }
}
