namespace Clinica.Modules.Seguridad.Application.Auth;

public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
