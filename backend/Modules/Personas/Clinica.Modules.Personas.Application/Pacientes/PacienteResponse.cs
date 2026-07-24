namespace Clinica.Modules.Personas.Application.Pacientes;

public sealed record PacienteResponse(
    Guid Id,
    Guid PersonaId,
    string PersonaNombreCompleto,
    string NumeroHistoriaClinica,
    Guid TipoDocumentoId,
    string TipoDocumentoNombre,
    string NumeroDocumento,
    Guid? ExtensionDocumentoId,
    string? ExtensionDocumentoNombre,
    string? ComplementoDocumento,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    DateOnly FechaNacimiento,
    Guid SexoId,
    string SexoNombre,
    Guid EstadoCivilId,
    string EstadoCivilNombre,
    string Telefono,
    string Direccion
);
