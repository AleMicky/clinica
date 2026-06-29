namespace Clinica.Modules.Seguridad.Application.Users;

public sealed record UsuarioPersonaResponse(
    Guid Id,
    string UserName,
    string NombreCompleto,
    string? Email,
    bool Activo,
    IReadOnlyList<string> Roles,
    Guid PersonaId,
    string PersonaNombreCompleto
);
