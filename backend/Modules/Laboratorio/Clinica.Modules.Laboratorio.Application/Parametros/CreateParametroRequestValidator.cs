using Clinica.Modules.Laboratorio.Domain.Constants;
using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Parametros;

public class CreateParametroRequestValidator : AbstractValidator<CreateParametroRequest>
{
    public CreateParametroRequestValidator()
    {
        RuleFor(x => x.PruebaId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TipoDato)
            .NotEmpty()
            .Must(t => ParametroTiposDato.All.Contains(t))
            .WithMessage($"TipoDato debe ser uno de: {string.Join(", ", ParametroTiposDato.All)}.");
        RuleFor(x => x.Orden).GreaterThanOrEqualTo(0);
    }
}
