namespace Clinica.Api.Modules.Seguridad.Auth;

public record LoginRequest(
    string UserName,
    string Password);

public record LoginResponse(
    string AccessToken,
    DateTime ExpiresAt,
    bool DebeCambiarPassword);

public record MeResponse
{
    public int Id { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string NombreCompleto { get; init; } = string.Empty;
    public List<string> Roles { get; init; } = [];
}

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public record RefreshTokenRequest(
    string RefreshToken);

public record RefreshTokenResponse(
    string AccessToken,
    DateTime ExpiresAt);