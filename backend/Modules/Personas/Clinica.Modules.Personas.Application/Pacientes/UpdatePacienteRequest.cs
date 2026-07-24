namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record UpdatePacienteRequest(
    Guid PersonaId,
    string NumeroHistoriaClinica
);
