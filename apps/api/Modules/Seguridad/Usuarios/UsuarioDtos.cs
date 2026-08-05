namespace Clinica.Api.Modules.Seguridad.Usuarios;

public record CreateUsuarioRequest(
    string Nombres,
    string Apellidos,
    string Email,
    string UserName,
    string Password,
    List<int> Roles);

public record UpdateUsuarioRequest(
    string Nombres,
    string Apellidos,
    string Email,
    string UserName,
    bool Activo,
    List<int> Roles);

public record UsuarioResponse
{
    public int Id { get; init; }

    public string Nombres { get; init; } = string.Empty;

    public string Apellidos { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string UserName { get; init; } = string.Empty;

    public bool Activo { get; init; }

    public List<string> Roles { get; init; } = [];
}