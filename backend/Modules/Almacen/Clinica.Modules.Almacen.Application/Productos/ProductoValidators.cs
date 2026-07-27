using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Productos;

public sealed class CreateProductoRequestValidator : AbstractValidator<CreateProductoRequest>
{
    public CreateProductoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CategoriaId).NotEmpty();
        RuleFor(x => x.UnidadMedidaId).NotEmpty();
        RuleFor(x => x.StockMinimo).GreaterThanOrEqualTo(0);
    }
}

public sealed class UpdateProductoRequestValidator : AbstractValidator<UpdateProductoRequest>
{
    public UpdateProductoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CategoriaId).NotEmpty();
        RuleFor(x => x.UnidadMedidaId).NotEmpty();
        RuleFor(x => x.StockMinimo).GreaterThanOrEqualTo(0);
    }
}
