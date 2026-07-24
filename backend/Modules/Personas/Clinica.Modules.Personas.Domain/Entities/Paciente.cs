using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class Paciente : AuditableEntity
{
    public Guid PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;
    public string NumeroHistoriaClinica { get; set; } = string.Empty;
}
