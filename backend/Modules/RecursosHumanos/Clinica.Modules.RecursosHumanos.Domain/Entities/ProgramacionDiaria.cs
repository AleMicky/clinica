using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class ProgramacionDiaria : AuditableEntity
{
    public Guid EmpleadoId { get; set; }

    public Empleado Empleado { get; set; } = null!;

    public DateOnly Fecha { get; set; }

    public Guid TurnoId { get; set; }

    public Turno Turno { get; set; } = null!;

    public Guid AreaId { get; set; }

    public Area Area { get; set; } = null!;

    public Guid CargoId { get; set; }

    public Cargo Cargo { get; set; } = null!;

    public Guid? EspecialidadId { get; set; }

    public Especialidad? Especialidad { get; set; }

    public bool EsMedicoTurno { get; set; }

    public bool AceptaConsultas { get; set; } = true;

    public bool AceptaSinCita { get; set; }

    public int MaxPacientes { get; set; }

    public string Estado { get; set; } = "ACTIVO";

    public string? Observacion { get; set; }

    /// <summary>
    /// Si es true, anula la restricción de un solo médico principal por área/horario.
    /// </summary>
    public bool PermiteMultiplesMedicosTurno { get; set; }
}
