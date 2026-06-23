using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Auth;

internal static class PasswordRules
{
    public static IRuleBuilderOptions<T, string> ApplyPasswordRules<T>(IRuleBuilder<T, string> rule) =>
        rule
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.");
}
