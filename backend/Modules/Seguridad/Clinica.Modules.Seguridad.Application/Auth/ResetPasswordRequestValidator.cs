using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Auth;

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.EmailOrUserName)
            .NotEmpty().WithMessage("El correo o nombre de usuario es obligatorio.");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("El token de restablecimiento es obligatorio.");

        PasswordRules.ApplyPasswordRules(RuleFor(x => x.NewPassword));
    }
}
