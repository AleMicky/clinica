using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Validators;

public abstract class TurnoCajaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : TurnoCajaRequest
{
    protected TurnoCajaRequestValidator()
    {
        RuleFor(x => x.CajaId)
            .GreaterThan(0)
            .WithMessage("La caja es obligatoria.");

        RuleFor(x => x.EmpleadoId)
            .GreaterThan(0)
            .WithMessage("El empleado es obligatorio.");

        RuleFor(x => x.FechaHoraApertura)
            .NotEqual(default(DateTime))
            .WithMessage("La fecha y hora de apertura son obligatorias.");

        RuleFor(x => x.FechaHoraCierre)
            .GreaterThanOrEqualTo(x => x.FechaHoraApertura)
            .WithMessage("La fecha y hora de cierre no puede ser anterior a la apertura.")
            .When(x => x.FechaHoraCierre.HasValue);

        RuleFor(x => x.FechaHoraCierre)
            .NotEmpty()
            .WithMessage("Si el turno está cerrado debe indicar la fecha y hora de cierre.")
            .When(x => x.Estado == EstadoTurnoCaja.Cerrado);

        RuleFor(x => x.Estado)
            .IsInEnum()
            .WithMessage("El estado del turno no es válido.");
    }
}

public sealed class CreateTurnoCajaRequestValidator
    : TurnoCajaRequestValidator<CreateTurnoCajaRequest>;

public sealed class UpdateTurnoCajaRequestValidator
    : TurnoCajaRequestValidator<UpdateTurnoCajaRequest>;
