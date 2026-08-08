using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Parametros.MetodoPago.Validators;

public abstract class MetodoPagoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : MetodoPagoRequest
{
    protected MetodoPagoRequestValidator()
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
    }
}

public sealed class CreateMetodoPagoRequestValidator
    : MetodoPagoRequestValidator<CreateMetodoPagoRequest>;

public sealed class UpdateMetodoPagoRequestValidator
    : MetodoPagoRequestValidator<UpdateMetodoPagoRequest>;
