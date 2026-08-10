namespace Clinica.Api.Modules.Seguridad.Roles;

public record CreateRolRequest(
    string Nombre,
    string? Descripcion);

public record UpdateRolRequest(
    string Nombre,
    string? Descripcion);

public record RolResponse(
    int Id,
    string Name,
    string? Descripcion);