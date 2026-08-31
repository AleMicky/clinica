using Clinica.Api.Modules.Almacenes.Producto.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.Producto.Validators;

public abstract class ProductoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ProductoRequest
{
    protected ProductoRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El código no puede superar los 20 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(150)
            .WithMessage("El nombre no puede superar los 150 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(500)
            .WithMessage("La descripción no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));

        RuleFor(x => x.CategoriaProductoId)
            .GreaterThan(0)
            .WithMessage("La categoría de producto es obligatoria.");

        RuleFor(x => x.UnidadMedidaId)
            .GreaterThan(0)
            .WithMessage("La unidad de medida es obligatoria.");

        RuleFor(x => x.StockMinimo)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El stock mínimo no puede ser negativo.");

        RuleFor(x => x.StockMaximo)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El stock máximo no puede ser negativo.")
            .When(x => x.StockMaximo.HasValue);

        RuleFor(x => x)
            .Must(x => !x.StockMaximo.HasValue || x.StockMinimo <= x.StockMaximo.Value)
            .WithMessage("El stock mínimo no puede ser mayor que el stock máximo.");
    }
}

public sealed class CreateProductoRequestValidator
    : ProductoRequestValidator<CreateProductoRequest>;

public sealed class UpdateProductoRequestValidator
    : ProductoRequestValidator<UpdateProductoRequest>;
