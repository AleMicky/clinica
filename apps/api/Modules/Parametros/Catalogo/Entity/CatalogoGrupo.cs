using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Catalogo.Entity;

public sealed class CatalogoGrupo : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public ICollection<CatalogoItem> Items { get; set; } = [];
}