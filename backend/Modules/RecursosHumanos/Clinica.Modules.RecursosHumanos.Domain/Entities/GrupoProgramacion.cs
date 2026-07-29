using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class GrupoProgramacion : AuditableEntity
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }

    public Guid AreaId { get; set; }
    public Area Area { get; set; } = null!;

    public ICollection<GrupoProgramacionEmpleado> Empleados { get; set; } = [];
    public ICollection<Programacion> Programaciones { get; set; } = [];
}