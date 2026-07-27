using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.TiposAtencion;

public class UpdateTipoAtencionRequestValidator : AbstractValidator<UpdateTipoAtencionRequest>
{
    public UpdateTipoAtencionRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Icono).MaximumLength(50);
        RuleFor(x => x.PrecioBase).GreaterThanOrEqualTo(0);
    }
}
