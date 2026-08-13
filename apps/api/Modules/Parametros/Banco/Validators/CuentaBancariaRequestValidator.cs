using Clinica.Api.Modules.Parametros.Banco.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Parametros.Banco.Validators;

public abstract class CuentaBancariaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CuentaBancariaRequest
{
    protected CuentaBancariaRequestValidator()
    {
        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.NumeroCuenta)
            .NotEmpty()
            .WithMessage("El número de cuenta es obligatorio.")
            .MaximumLength(40)
            .WithMessage("El número de cuenta no puede superar los 40 caracteres.");

        RuleFor(x => x.NombreCuenta)
            .MaximumLength(150)
            .WithMessage("El nombre de la cuenta no puede superar los 150 caracteres.");

        RuleFor(x => x.TipoCuenta)
            .MaximumLength(30)
            .WithMessage("El tipo de cuenta no puede superar los 30 caracteres.");
    }
}

public sealed class CreateCuentaBancariaRequestValidator
    : CuentaBancariaRequestValidator<CreateCuentaBancariaRequest>;

public sealed class UpdateCuentaBancariaRequestValidator
    : CuentaBancariaRequestValidator<UpdateCuentaBancariaRequest>;
