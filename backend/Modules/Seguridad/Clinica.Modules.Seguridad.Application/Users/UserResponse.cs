namespace Clinica.Modules.Seguridad.Application.Users;

public record UserResponse(
    Guid Id,
    string UserName,
    string NombreCompleto,
    string? Email,
    bool Activo,
    IReadOnlyList<string> Roles);
