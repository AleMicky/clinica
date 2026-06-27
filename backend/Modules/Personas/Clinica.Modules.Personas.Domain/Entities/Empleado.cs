using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class Empleado: AuditableEntity
{
    public Guid PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;

    public string CodigoEmpleado { get; set; } = string.Empty;
    public DateOnly? FechaIngreso { get; set; }
    
    public Guid AreaId { get; set; }
    public Area Area { get; set; } = null!;

    public Guid DepartamentoId { get; set; }
    public Departamento Departamento { get; set; } = null!;

    public Guid ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;

    public Guid ProfesionId { get; set; }
    public Profesion Profesion { get; set; } = null!;

    public Guid CargoId { get; set; }
    public Cargo Cargo { get; set; } = null!;
}
