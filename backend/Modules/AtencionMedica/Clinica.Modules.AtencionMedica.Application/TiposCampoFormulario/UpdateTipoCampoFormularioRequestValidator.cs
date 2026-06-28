using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;

public class UpdateTipoCampoFormularioRequestValidator
    : AbstractValidator<UpdateTipoCampoFormularioRequest>
{
    public UpdateTipoCampoFormularioRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ControlFrontend).NotEmpty().MaximumLength(50);
        RuleFor(x => x.TipoDato).NotEmpty().MaximumLength(30);
    }
}
