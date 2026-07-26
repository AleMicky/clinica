using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.TiposArea;

public class CreateTipoAreaRequestValidator : AbstractValidator<CreateTipoAreaRequest>
{
    public CreateTipoAreaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.Orden).GreaterThanOrEqualTo(0);
    }
}
