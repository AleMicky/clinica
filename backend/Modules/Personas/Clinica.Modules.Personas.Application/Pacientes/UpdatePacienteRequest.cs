using Clinica.Modules.Personas.Application.Personas;

namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record UpdatePacienteRequest(
    Guid PersonaId,
    string NumeroHistoriaClinica,
    UpdatePersonaRequest? Persona = null
);
