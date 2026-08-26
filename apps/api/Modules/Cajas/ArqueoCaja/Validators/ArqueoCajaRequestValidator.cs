using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Validators;

public sealed class ArqueoCajaDetalleRequestValidator
    : AbstractValidator<ArqueoCajaDetalleRequest>
{
    public ArqueoCajaDetalleRequestValidator()
    {
        RuleFor(x => x.MetodoPagoId)
            .GreaterThan(0)
            .WithMessage("El método de pago es obligatorio.");

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.MontoContado)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El monto contado no puede ser negativo.");
    }
}

public sealed class RegistrarArqueoCajaRequestValidator
    : AbstractValidator<RegistrarArqueoCajaRequest>
{
    public RegistrarArqueoCajaRequestValidator()
    {
        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("El arqueo debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new ArqueoCajaDetalleRequestValidator());
    }
}