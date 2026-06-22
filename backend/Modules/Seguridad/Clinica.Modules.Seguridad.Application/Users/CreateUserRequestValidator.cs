using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Users;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty().WithMessage("El nombre de usuario es obligatorio.")
            .MaximumLength(100)
            .Matches(@"^[a-zA-Z0-9._-]+$")
            .WithMessage("El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.");
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8);
        RuleFor(x => x.NombreCompleto)
            .NotEmpty().WithMessage("El nombre completo es obligatorio.")
            .MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
