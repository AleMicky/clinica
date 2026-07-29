using Clinica.Modules.RecursosHumanos.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class ProgramacionDiaria : AuditableEntity
{
    public Guid ProgramacionId { get; set; }
    public Programacion Programacion { get; set; } = null!;

    public Guid EmpleadoId { get; set; }
    public Empleado Empleado { get; set; } = null!;

    public DateOnly Fecha { get; set; }

    public Guid? TurnoId { get; set; }
    public Turno? Turno { get; set; }

    public TipoAsignacionProgramacion TipoAsignacion { get; set; } = TipoAsignacionProgramacion.Regular;
    public string? Observacion { get; set; }
}
