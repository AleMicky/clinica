using Clinica.Modules.Personas.Application.Personas;

namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record CreatePacienteRequest(
    string Modo,
    Guid? PersonaId,
    CreatePersonaRequest? Persona,
    string? NumeroHistoriaClinica = null
);
