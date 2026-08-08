using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Entity;

public sealed class MedicoEspecialidad : AuditableEntity
{
    public int MedicoId { get; set; }
    public Medico Medico { get; set; } = null!;

    public int EspecialidadId { get; set; }
    public Especialidad.Entity.Especialidad Especialidad { get; set; } = null!;

    public bool EsPrincipal { get; set; }
}