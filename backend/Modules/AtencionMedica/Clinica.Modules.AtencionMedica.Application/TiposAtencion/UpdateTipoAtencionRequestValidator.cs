using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.TiposAtencion;

public class UpdateTipoAtencionRequestValidator : AbstractValidator<UpdateTipoAtencionRequest>
{
    public UpdateTipoAtencionRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
