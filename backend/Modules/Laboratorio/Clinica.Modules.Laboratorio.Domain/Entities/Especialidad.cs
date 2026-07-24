using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class Especialidad : AuditableEntity, INamedCatalogEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int Orden { get; set; }
}
