namespace Clinica.Api.Modules.Seguridad.Auth;

public record LoginRequest(
    string UserName,
    string Password);

public record LoginResponse(
    string AccessToken,
    DateTime ExpiresAt,
    bool DebeCambiarPassword);

public record PersonaPerfilDto
{
    public int Id { get; init; }
    public string Nombres { get; init; } = string.Empty;
    public string ApellidoPaterno { get; init; } = string.Empty;
    public string? ApellidoMaterno { get; init; }
    public string TipoDocumento { get; init; } = string.Empty;
    public string NumeroDocumento { get; init; } = string.Empty;
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
    public string? Telefono { get; init; }
    public string? Direccion { get; init; }
    public DateOnly FechaNacimiento { get; init; }
    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}

public record MeResponse
{
    public int Id { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Nombres { get; init; } = string.Empty;
    public string ApellidoPaterno { get; init; } = string.Empty;
    public string? ApellidoMaterno { get; init; }
    public string NombreCompleto { get; init; } = string.Empty;
    public bool Activo { get; init; }
    public bool DebeCambiarPassword { get; init; }
    public List<string> Roles { get; init; } = [];
    public PersonaPerfilDto? Persona { get; init; }
}

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public record LogoutResponse(
    string Message);

public record RefreshTokenRequest(
    string RefreshToken);

public record RefreshTokenResponse(
    string AccessToken,
    DateTime ExpiresAt);