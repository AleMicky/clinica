using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.FormulariosClinicos;

public class CreateFormularioClinicoRequestValidator
    : AbstractValidator<CreateFormularioClinicoRequest>
{
    public CreateFormularioClinicoRequestValidator()
    {
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.Version).GreaterThan(0);
    }
}
