namespace Clinica.Modules.Seguridad.Application.Users;

public sealed record UserResponse(
    Guid Id,
    string UserName,
    string NombreCompleto,
    string? Email,
    bool Activo,
    IReadOnlyList<string> Roles,
    Guid? PersonaId = null,
    string? PersonaNombreCompleto = null,
    string? PersonaNumeroDocumento = null,
    string? PersonaTipoDocumentoNombre = null,
    string? PersonaTelefono = null,
    string? PersonaExtensionDocumentoNombre = null,
    string? PersonaComplementoDocumento = null,
    DateTime? CreatedAt = null
);