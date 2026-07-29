using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class GrupoProgramacionEmpleado : AuditableEntity
{
    public Guid GrupoProgramacionId { get; set; }
    public GrupoProgramacion GrupoProgramacion { get; set; } = null!;

    public Guid EmpleadoId { get; set; }
    public Empleado Empleado { get; set; } = null!;
}