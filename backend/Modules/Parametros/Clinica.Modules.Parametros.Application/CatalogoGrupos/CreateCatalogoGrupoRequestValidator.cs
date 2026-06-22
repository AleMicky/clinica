using FluentValidation;

namespace Clinica.Modules.Parametros.Application.CatalogoGrupos;

public class CreateCatalogoGrupoRequestValidator : AbstractValidator<CreateCatalogoGrupoRequest>
{
    public CreateCatalogoGrupoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
