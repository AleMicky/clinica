using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Categorias;

public sealed class CreateCategoriaProductoRequestValidator : AbstractValidator<CreateCategoriaProductoRequest>
{
    public CreateCategoriaProductoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}

public sealed class UpdateCategoriaProductoRequestValidator : AbstractValidator<UpdateCategoriaProductoRequest>
{
    public UpdateCategoriaProductoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}
