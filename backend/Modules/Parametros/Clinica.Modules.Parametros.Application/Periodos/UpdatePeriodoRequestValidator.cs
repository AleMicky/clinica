using FluentValidation;

namespace Clinica.Modules.Parametros.Application.Periodos;

public class UpdatePeriodoRequestValidator : AbstractValidator<UpdatePeriodoRequest>
{
    public UpdatePeriodoRequestValidator()
    {
        RuleFor(x => x.FechaInicio)
            .LessThan(x => x.FechaFin)
            .WithMessage("La fecha de inicio debe ser anterior a la fecha de fin.");

        RuleFor(x => x.Literal)
            .NotEmpty()
            .MaximumLength(100);
    }
}
