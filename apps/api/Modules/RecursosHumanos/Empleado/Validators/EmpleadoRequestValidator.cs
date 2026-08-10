using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Validators;

public abstract class EmpleadoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : EmpleadoRequest
{
    protected EmpleadoRequestValidator()
    {
        RuleFor(x => x.PersonaId)
            .GreaterThan(0)
            .WithMessage("La persona es obligatoria.");

        RuleFor(x => x.FechaIngreso)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de ingreso no puede ser futura.")
            .When(x => x.FechaIngreso.HasValue);

        RuleFor(x => x.FechaIngreso)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de ingreso no puede ser futura.");

        RuleFor(x => x.FechaRetiro)
            .GreaterThanOrEqualTo(x => x.FechaIngreso)
            .WithMessage("La fecha de retiro no puede ser anterior a la fecha de ingreso.")
            .When(x => x.FechaRetiro.HasValue);
    }
}

public sealed class CreateEmpleadoRequestValidator
    : EmpleadoRequestValidator<CreateEmpleadoRequest>;

public sealed class UpdateEmpleadoRequestValidator
    : EmpleadoRequestValidator<UpdateEmpleadoRequest>;