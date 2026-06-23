namespace Clinica.Modules.Seguridad.Application.Auth;

public sealed record ResetPasswordRequest(
    string EmailOrUserName,
    string Token,
    string NewPassword);
