namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record PacienteResponse(
    Guid Id,
    Guid PersonaId,
    string PersonaNombreCompleto,
    string NumeroHistoriaClinica,
    string TipoDocumentoNombre,
    string NumeroDocumento,
    string? ExtensionDocumentoNombre,
    string? ComplementoDocumento,
    DateOnly FechaNacimiento,
    string SexoNombre,
    string Telefono,
    string Direccion
);
