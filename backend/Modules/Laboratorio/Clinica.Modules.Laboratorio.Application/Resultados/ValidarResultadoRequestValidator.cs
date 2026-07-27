using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Resultados;

public class ValidarResultadoRequestValidator : AbstractValidator<ValidarResultadoRequest>
{
    public ValidarResultadoRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(500);
    }
}
