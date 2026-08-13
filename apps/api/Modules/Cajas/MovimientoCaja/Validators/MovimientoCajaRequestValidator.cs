using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Validators;

public abstract class MovimientoCajaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : MovimientoCajaRequest
{
    protected MovimientoCajaRequestValidator()
    {
        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.Tipo)
            .IsInEnum()
            .WithMessage("El tipo de movimiento no es válido.");

        RuleFor(x => x.FechaHora)
            .NotEqual(default(DateTime))
            .WithMessage("La fecha y hora del movimiento son obligatorias.");

        RuleFor(x => x.Monto)
            .GreaterThan(0)
            .WithMessage("El monto del movimiento debe ser mayor que cero.");

        RuleFor(x => x.Concepto)
            .NotEmpty()
            .WithMessage("El concepto es obligatorio.")
            .MaximumLength(250)
            .WithMessage("El concepto no puede superar los 250 caracteres.");

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

public sealed class CreateMovimientoCajaRequestValidator
    : MovimientoCajaRequestValidator<CreateMovimientoCajaRequest>;

public sealed class UpdateMovimientoCajaRequestValidator
    : MovimientoCajaRequestValidator<UpdateMovimientoCajaRequest>;