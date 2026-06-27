using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class CatalogoGrupo : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
 }