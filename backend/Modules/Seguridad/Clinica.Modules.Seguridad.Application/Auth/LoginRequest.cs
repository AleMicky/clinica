namespace Clinica.Modules.Seguridad.Application.Auth;

public sealed record LoginRequest(
    string UserName,
    string Password
);