using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.FormularioSecciones;

public class UpdateFormularioSeccionRequestValidator
    : AbstractValidator<UpdateFormularioSeccionRequest>
{
    public UpdateFormularioSeccionRequestValidator()
    {
        RuleFor(x => x.FormularioClinicoId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Orden).GreaterThanOrEqualTo(0);
    }
}
