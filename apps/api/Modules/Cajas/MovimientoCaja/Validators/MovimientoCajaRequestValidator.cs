using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Validators;

public sealed class RegistrarMovimientoCajaRequestValidator
    : AbstractValidator<RegistrarMovimientoCajaRequest>
{
    public RegistrarMovimientoCajaRequestValidator()
    {
        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.TipoMovimientoCajaId)
            .GreaterThan(0)
            .WithMessage("El tipo de movimiento es obligatorio.");

        RuleFor(x => x.ConceptoMovimientoCajaId)
            .GreaterThan(0)
            .WithMessage("El concepto de movimiento es obligatorio.");

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.Monto)
            .GreaterThan(0)
            .WithMessage("El monto del movimiento debe ser mayor que cero.");

        RuleFor(x => x.TipoCambio)
            .GreaterThan(0)
            .WithMessage("El tipo de cambio debe ser mayor que cero.");

        RuleFor(x => x.Referencia)
            .MaximumLength(100)
            .WithMessage("La referencia no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Referencia));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}