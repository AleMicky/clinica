namespace Clinica.Modules.Seguridad.Application.Roles;

public sealed record CreateRoleRequest(
    string Name,
    string? Descripcion = null
);