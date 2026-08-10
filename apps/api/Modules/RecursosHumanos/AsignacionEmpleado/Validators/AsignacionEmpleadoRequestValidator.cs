using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Validators;

public abstract class AsignacionEmpleadoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : AsignacionEmpleadoRequest
{
    protected AsignacionEmpleadoRequestValidator()
    {
        RuleFor(x => x.EmpleadoId)
            .GreaterThan(0)
            .WithMessage("El empleado es obligatorio.");

        RuleFor(x => x.AreaId)
            .GreaterThan(0)
            .WithMessage("El área es obligatoria.");

        RuleFor(x => x.CargoId)
            .GreaterThan(0)
            .WithMessage("El cargo es obligatorio.");

        RuleFor(x => x.FechaInicio)
            .NotEqual(default(DateOnly))
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .WithMessage("La fecha de fin no puede ser anterior a la fecha de inicio.")
            .When(x => x.FechaFin.HasValue);

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateAsignacionEmpleadoRequestValidator
    : AsignacionEmpleadoRequestValidator<CreateAsignacionEmpleadoRequest>;

public sealed class UpdateAsignacionEmpleadoRequestValidator
    : AsignacionEmpleadoRequestValidator<UpdateAsignacionEmpleadoRequest>;