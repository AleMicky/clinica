namespace Clinica.Modules.Personas.Application.Personas;

public sealed record UpdatePersonaRequest(
    Guid TipoDocumentoId,
    string NumeroDocumento,
    string Nombres,
    string ApellidoPaterno,
    string ApellidoMaterno,
    DateOnly FechaNacimiento,
    Guid SexoId,
    Guid EstadoCivilId,
    string Telefono,
    string Direccion,
    Guid? ExtensionDocumentoId = null,
    string? ComplementoDocumento = null
);
