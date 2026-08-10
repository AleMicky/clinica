using Clinica.Api.Modules.Seguridad.Roles.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Seguridad.Roles.Validators;

public abstract class RolRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : RolRequest
{
    protected RolRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("El nombre del rol es obligatorio.")
            .MaximumLength(256)
            .WithMessage("El nombre del rol no puede superar los 256 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250)
            .WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));
    }
}

public sealed class CreateRolRequestValidator : RolRequestValidator<CreateRolRequest>;

public sealed class UpdateRolRequestValidator : RolRequestValidator<UpdateRolRequest>;