using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class Turno : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;

    public string Nombre { get; set; } = string.Empty;

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public bool CruceDia { get; set; }

    public bool Activo { get; set; } = true;

    /// <summary>
    /// Si es true, permite más de un médico principal de turno por área y horario.
    /// </summary>
    public bool PermiteMultiplesMedicosTurno { get; set; }
}
