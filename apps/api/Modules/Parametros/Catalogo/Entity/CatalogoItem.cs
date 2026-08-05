using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Catalogo.Entity;

public sealed class CatalogoItem : AuditableEntity
{
    public int CatalogoGrupoId { get; set; }
    public CatalogoGrupo CatalogoGrupo { get; set; } = null!;

    public string Valor { get; set; }
    public string Nombre { get; set; }
    public int Orden { get; set; }
}