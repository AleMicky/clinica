namespace Clinica.Modules.Seguridad.Application.Roles;

public sealed record UpdateRoleRequest(
    string Name,
    string? Descripcion
);
