namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record UpdatePacienteRequest(
    Guid PersonaId,
    string NumeroHistoriaClinica,
    Guid? GrupoSanguineoId = null,
    string? Alergias = null,
    string? Observaciones = null
);
