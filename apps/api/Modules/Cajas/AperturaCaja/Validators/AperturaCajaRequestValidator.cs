using Clinica.Api.Modules.Cajas.AperturaCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.AperturaCaja.Validators;

public abstract class AperturaCajaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : AperturaCajaRequest
{
    protected AperturaCajaRequestValidator()
    {
        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.FechaHora)
            .NotEqual(default(DateTime))
            .WithMessage("La fecha y hora de apertura son obligatorias.");

        RuleFor(x => x.MontoInicial)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El monto inicial no puede ser negativo.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateAperturaCajaRequestValidator
    : AperturaCajaRequestValidator<CreateAperturaCajaRequest>;

public sealed class UpdateAperturaCajaRequestValidator
    : AperturaCajaRequestValidator<UpdateAperturaCajaRequest>;