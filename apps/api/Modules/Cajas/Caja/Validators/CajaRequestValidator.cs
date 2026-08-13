using Clinica.Api.Modules.Cajas.Caja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.Caja.Validators;

public abstract class CajaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CajaRequest
{
    protected CajaRequestValidator()
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

public sealed class CreateCajaRequestValidator : CajaRequestValidator<CreateCajaRequest>;

public sealed class UpdateCajaRequestValidator : CajaRequestValidator<UpdateCajaRequest>;
