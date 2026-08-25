using Clinica.Api.Modules.Cajas.DevolucionCobro.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Validators;

public abstract class DevolucionCobroRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : DevolucionCobroRequest
{
    protected DevolucionCobroRequestValidator()
    {
        RuleFor(x => x.CobroId)
            .GreaterThan(0)
            .WithMessage("El cobro es obligatorio.");

        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.MetodoPagoId)
            .GreaterThan(0)
            .WithMessage("El método de pago es obligatorio.");

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.FechaHora)
            .NotEqual(default(DateTime))
            .WithMessage("La fecha y hora de la devolución son obligatorias.");

        RuleFor(x => x.Monto)
            .GreaterThan(0)
            .WithMessage("El monto de la devolución debe ser mayor que cero.");

        RuleFor(x => x.Motivo)
            .NotEmpty()
            .WithMessage("El motivo de la devolución es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo no puede superar los 500 caracteres.");
    }
}

public sealed class CreateDevolucionCobroRequestValidator
    : DevolucionCobroRequestValidator<CreateDevolucionCobroRequest>;

public sealed class UpdateDevolucionCobroRequestValidator
    : DevolucionCobroRequestValidator<UpdateDevolucionCobroRequest>;