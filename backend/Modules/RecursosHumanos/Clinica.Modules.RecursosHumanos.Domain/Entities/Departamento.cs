using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class Departamento : AuditableEntity
{
    public Guid AreaId { get; set; }
    public Area Area { get; set; } = null!;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public ICollection<Servicio> Servicios { get; set; } = [];
}