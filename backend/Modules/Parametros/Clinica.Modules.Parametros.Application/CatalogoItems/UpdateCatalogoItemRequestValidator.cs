using FluentValidation;

namespace Clinica.Modules.Parametros.Application.CatalogoItems;

public class UpdateCatalogoItemRequestValidator : AbstractValidator<UpdateCatalogoItemRequest>
{
    public UpdateCatalogoItemRequestValidator()
    {
        RuleFor(x => x.CatalogoGrupoId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Valor).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Orden).GreaterThanOrEqualTo(0);
    }
}
