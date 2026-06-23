namespace Clinica.Modules.Seguridad.Application.Users;

public sealed record UpdateUserRequest(
    string NombreCompleto,
    string? Email,
    bool Activo
);
