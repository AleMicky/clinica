using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class Area : AuditableEntity, INamedCatalogEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public Guid TipoAreaId { get; set; }
    public TipoArea TipoArea { get; set; } = null!;

    public Guid? AreaPadreId { get; set; }
    public Area? AreaPadre { get; set; }

    public Guid? ResponsableEmpleadoId { get; set; }
    public Empleado? ResponsableEmpleado { get; set; }

    public ICollection<Area> SubAreas { get; set; } = [];
}
