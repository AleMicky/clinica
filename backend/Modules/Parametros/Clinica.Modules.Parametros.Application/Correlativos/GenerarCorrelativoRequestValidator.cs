using FluentValidation;

namespace Clinica.Modules.Parametros.Application.Correlativos;

public class GenerarCorrelativoRequestValidator : AbstractValidator<GenerarCorrelativoRequest>
{
    public GenerarCorrelativoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Gestion)
            .InclusiveBetween(2000, 2100)
            .When(x => x.Gestion.HasValue);
        RuleFor(x => x.Prefijo).MaximumLength(20);
        RuleFor(x => x.Longitud)
            .InclusiveBetween(1, 20)
            .When(x => x.Longitud.HasValue);
    }
}
