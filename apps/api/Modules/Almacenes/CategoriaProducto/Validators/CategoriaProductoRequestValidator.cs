using Clinica.Api.Modules.Almacenes.CategoriaProducto.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.CategoriaProducto.Validators;

public abstract class CategoriaProductoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CategoriaProductoRequest
{
    protected CategoriaProductoRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(10)
            .WithMessage("El código no puede superar los 10 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250)
            .WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));

        RuleFor(x => x.CategoriaPadreId)
            .NotEqual(0)
            .WithMessage("El identificador de la categoría padre es inválido.")
            .When(x => x.CategoriaPadreId.HasValue);
    }
}

public sealed class CreateCategoriaProductoRequestValidator
    : CategoriaProductoRequestValidator<CreateCategoriaProductoRequest>;

public sealed class UpdateCategoriaProductoRequestValidator
    : CategoriaProductoRequestValidator<UpdateCategoriaProductoRequest>;
