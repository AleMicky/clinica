namespace Clinica.Modules.Seguridad.Application.Users;

public sealed record CreateUserRequest(
    string UserName,
    string Password,
    string NombreCompleto,
    string? Email = null,
    string? Role = null
);