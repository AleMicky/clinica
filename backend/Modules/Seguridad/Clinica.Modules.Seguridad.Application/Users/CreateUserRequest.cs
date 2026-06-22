namespace Clinica.Modules.Seguridad.Application.Users;

public record CreateUserRequest(
    string UserName,
    string Password,
    string NombreCompleto,
    string? Email = null,
    string? Role = null);
