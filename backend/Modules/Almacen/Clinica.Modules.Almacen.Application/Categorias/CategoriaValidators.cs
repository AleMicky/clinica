using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Categorias;

public sealed class CreateCategoriaRequestValidator : AbstractValidator<CreateCategoriaRequest>
{
    public CreateCategoriaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}

public sealed class UpdateCategoriaRequestValidator : AbstractValidator<UpdateCategoriaRequest>
{
    public UpdateCategoriaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}
