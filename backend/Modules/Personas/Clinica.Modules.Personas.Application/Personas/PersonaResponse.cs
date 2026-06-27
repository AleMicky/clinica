namespace Clinica.Modules.Personas.Application.Personas;

public sealed record PersonaResponse(
    Guid Id,
    Guid TipoDocumentoId,
    string TipoDocumentoNombre,
    string NumeroDocumento,
    Guid? ExtensionDocumentoId,
    string? ExtensionDocumentoNombre,
    string? ComplementoDocumento,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    string NombreCompleto,
    DateOnly FechaNacimiento,
    Guid SexoId,
    string SexoNombre,
    Guid EstadoCivilId,
    string EstadoCivilNombre,
    string Telefono,
    string Direccion
);
