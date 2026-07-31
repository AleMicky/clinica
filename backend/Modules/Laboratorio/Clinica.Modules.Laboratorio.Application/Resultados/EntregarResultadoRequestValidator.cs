using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Resultados;

public class EntregarResultadoRequestValidator : AbstractValidator<EntregarResultadoRequest>
{
    public EntregarResultadoRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(500);
    }
}
