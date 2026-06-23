using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Auth;

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.EmailOrUserName)
            .NotEmpty().WithMessage("El correo o nombre de usuario es obligatorio.");
    }
}
