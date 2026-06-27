using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class CatalogoItem : AuditableEntity
{
    public Guid CatalogoGrupoId { get; set; }
    public CatalogoGrupo CatalogoGrupo { get; set; } = null!;

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public int Orden { get; set; }
}