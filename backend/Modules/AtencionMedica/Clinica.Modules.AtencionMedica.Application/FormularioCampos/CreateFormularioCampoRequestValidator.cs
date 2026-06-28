using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.FormularioCampos;

public class CreateFormularioCampoRequestValidator
    : AbstractValidator<CreateFormularioCampoRequest>
{
    public CreateFormularioCampoRequestValidator()
    {
        RuleFor(x => x.FormularioSeccionId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Etiqueta).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TipoCampoFormularioId).NotEmpty();
        RuleFor(x => x.Orden).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Placeholder).MaximumLength(200);
        RuleFor(x => x.ValorDefecto).MaximumLength(500);
    }
}
