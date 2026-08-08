using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Parametros.Catalogo.Validators;

public abstract class CatalogoItemRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CatalogoItemRequest
{
    protected CatalogoItemRequestValidator()
    {
        RuleFor(x => x.Valor)
            .NotEmpty()
            .WithMessage("El valor es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El valor no puede superar los 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Orden)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El orden debe ser mayor o igual a 0.");
    }
}

public sealed class CreateCatalogoItemRequestValidator
    : CatalogoItemRequestValidator<CreateCatalogoItemRequest>;

public sealed class UpdateCatalogoItemRequestValidator
    : CatalogoItemRequestValidator<UpdateCatalogoItemRequest>;
