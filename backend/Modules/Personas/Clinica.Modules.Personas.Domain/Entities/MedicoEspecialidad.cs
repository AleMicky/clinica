using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class MedicoEspecialidad : AuditableEntity
{
    public Guid MedicoId { get; set; }
    public Medico Medico { get; set; } = null!;

    public Guid EspecialidadId { get; set; }
    public Especialidad Especialidad { get; set; } = null!;

    public bool EsPrincipal { get; set; }
}
