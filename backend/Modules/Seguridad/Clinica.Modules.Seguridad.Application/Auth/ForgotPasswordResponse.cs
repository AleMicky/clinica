namespace Clinica.Modules.Seguridad.Application.Auth;

public sealed record ForgotPasswordResponse(
    string Message,
    string? ResetToken = null);
