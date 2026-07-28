using FluentValidation;

namespace Clinica.Modules.Parametros.Application.Gestiones;

public class CreateGestionRequestValidator : AbstractValidator<CreateGestionRequest>
{
    public CreateGestionRequestValidator()
    {
        RuleFor(x => x.Gestion)
            .InclusiveBetween(2000, 2100);

        RuleFor(x => x.FechaInicio)
            .LessThan(x => x.FechaFin)
            .WithMessage("La fecha de inicio debe ser anterior a la fecha de fin.");

        RuleFor(x => x.Literal)
            .NotEmpty()
            .MaximumLength(100);
    }
}
