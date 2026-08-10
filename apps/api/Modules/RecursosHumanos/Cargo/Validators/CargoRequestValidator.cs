using Clinica.Api.Modules.RecursosHumanos.Cargo.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Validators;

public abstract class CargoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CargoRequest
{
    protected CargoRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El código no puede superar los 20 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250)
            .WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));
    }
}

public sealed class CreateCargoRequestValidator : CargoRequestValidator<CreateCargoRequest>;

public sealed class UpdateCargoRequestValidator : CargoRequestValidator<UpdateCargoRequest>;