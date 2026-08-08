using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Entity;

public class Paciente : AuditableEntity
{
    public string NumeroHistoriaClinica { get; set; } = string.Empty;
    
    public int PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;
}