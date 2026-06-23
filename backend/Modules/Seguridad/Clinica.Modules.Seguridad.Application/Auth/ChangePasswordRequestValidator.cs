using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Auth;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("La contraseña actual es obligatoria.");

        PasswordRules.ApplyPasswordRules(RuleFor(x => x.NewPassword));
    }
}
