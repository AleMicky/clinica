namespace Clinica.Modules.Seguridad.Application.Roles;

public sealed record RoleResponse(
    Guid Id,
    string Name,
    string? Descripcion
);