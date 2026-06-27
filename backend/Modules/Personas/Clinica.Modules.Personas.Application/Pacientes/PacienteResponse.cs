namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record PacienteResponse(
    Guid Id,
    Guid PersonaId,
    string PersonaNombreCompleto,
    string NumeroHistoriaClinica,
    Guid? GrupoSanguineoId,
    string? GrupoSanguineoNombre,
    string? Alergias,
    string? Observaciones,
    DateTime FechaRegistro
);
