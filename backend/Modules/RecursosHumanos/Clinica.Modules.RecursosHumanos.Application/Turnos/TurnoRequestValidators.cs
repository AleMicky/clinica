using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Turnos;

public class CreateTurnoRequestValidator : AbstractValidator<CreateTurnoRequest>
{
    public CreateTurnoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x)
            .Must(x => x.HoraInicio != x.HoraFin)
            .WithMessage("La hora de inicio debe ser distinta a la hora de fin.");
        RuleFor(x => x)
            .Must(x => !x.CruceDia || x.HoraFin < x.HoraInicio)
            .WithMessage("Si el turno cruza de día, la hora de fin debe ser menor que la hora de inicio.");
        RuleFor(x => x)
            .Must(x => x.CruceDia || x.HoraFin > x.HoraInicio)
            .WithMessage("Si el turno no cruza de día, la hora de fin debe ser mayor que la hora de inicio.");
    }
}

public class UpdateTurnoRequestValidator : AbstractValidator<UpdateTurnoRequest>
{
    public UpdateTurnoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x)
            .Must(x => x.HoraInicio != x.HoraFin)
            .WithMessage("La hora de inicio debe ser distinta a la hora de fin.");
        RuleFor(x => x)
            .Must(x => !x.CruceDia || x.HoraFin < x.HoraInicio)
            .WithMessage("Si el turno cruza de día, la hora de fin debe ser menor que la hora de inicio.");
        RuleFor(x => x)
            .Must(x => x.CruceDia || x.HoraFin > x.HoraInicio)
            .WithMessage("Si el turno no cruza de día, la hora de fin debe ser mayor que la hora de inicio.");
    }
}
