using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.Cobro.Validators;

public sealed class CobroDetalleRequestValidator
    : AbstractValidator<CobroDetalleRequest>
{
    public CobroDetalleRequestValidator()
    {
        RuleFor(x => x.MetodoPagoId)
            .GreaterThan(0)
            .WithMessage("El método de pago es obligatorio.");

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.CuentaBancariaId)
            .GreaterThan(0)
            .When(x => x.CuentaBancariaId.HasValue)
            .WithMessage("La cuenta bancaria no es válida.");

        RuleFor(x => x.Monto)
            .GreaterThan(0)
            .WithMessage("El monto debe ser mayor a cero.");

        RuleFor(x => x.TipoCambio)
            .GreaterThan(0)
            .WithMessage("El tipo de cambio debe ser mayor a cero.");

        RuleFor(x => x.Referencia)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Referencia));

        RuleFor(x => x.EntidadFinanciera)
            .MaximumLength(150)
            .When(x => !string.IsNullOrWhiteSpace(x.EntidadFinanciera));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}