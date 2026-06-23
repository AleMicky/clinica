namespace Clinica.Modules.Seguridad.Application.Auth;

public sealed record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    Guid UserId,
    string UserName,
    string NombreCompleto,
    IReadOnlyList<string> Roles
);