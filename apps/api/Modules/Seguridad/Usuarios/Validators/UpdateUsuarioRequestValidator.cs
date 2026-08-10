using Clinica.Api.Modules.Seguridad.Usuarios.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Seguridad.Usuarios.Validators;

public sealed class UpdateUsuarioRequestValidator
    : AbstractValidator<UpdateUsuarioRequest>
{
    public UpdateUsuarioRequestValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("El nombre de usuario es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre de usuario no puede superar los 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress()
            .WithMessage("El correo electrónico no es válido.")
            .MaximumLength(256)
            .WithMessage("El correo electrónico no puede superar los 256 caracteres.");

        RuleFor(x => x.Roles)
            .NotNull()
            .WithMessage("La lista de roles es obligatoria.");

        RuleForEach(x => x.Roles)
            .NotEmpty()
            .WithMessage("El nombre del rol no puede estar vacío.")
            .MaximumLength(256)
            .WithMessage("El nombre del rol no puede superar los 256 caracteres.");
    }
}