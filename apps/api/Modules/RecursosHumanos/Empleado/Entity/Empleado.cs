using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;

public class Empleado : AuditableEntity
{
    public int PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;

    public string CodigoEmpleado { get; set; } = string.Empty;
    public DateOnly FechaIngreso { get; set; }

    public DateOnly? FechaRetiro { get; set; }

    public ICollection<AsignacionEmpleado.Entity.AsignacionEmpleado>
        Asignaciones { get; set; } = [];
}