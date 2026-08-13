using Clinica.Api.Modules.Cajas.CierreCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.CierreCaja.Validators;

public abstract class CierreCajaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CierreCajaRequest
{
    protected CierreCajaRequestValidator()
    {
        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.ArqueoCajaId)
            .GreaterThan(0)
            .WithMessage("El arqueo de caja es obligatorio.");

        RuleFor(x => x.FechaHora)
            .NotEqual(default(DateTime))
            .WithMessage("La fecha y hora de cierre son obligatorias.");

        RuleFor(x => x.MontoApertura)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El monto de apertura no puede ser negativo.");

        RuleFor(x => x.TotalIngresos)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El total de ingresos no puede ser negativo.");

        RuleFor(x => x.TotalEgresos)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El total de egresos no puede ser negativo.");

        RuleFor(x => x.TotalCobros)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El total de cobros no puede ser negativo.");

        RuleFor(x => x.TotalEsperado)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El total esperado no puede ser negativo.");

        RuleFor(x => x.TotalContado)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El total contado no puede ser negativo.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateCierreCajaRequestValidator
    : CierreCajaRequestValidator<CreateCierreCajaRequest>;

public sealed class UpdateCierreCajaRequestValidator
    : CierreCajaRequestValidator<UpdateCierreCajaRequest>;