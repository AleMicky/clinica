using FluentValidation;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Validators;

public abstract class UnidadesMedidaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : UnidadesMedidaRequest
{
    protected UnidadesMedidaRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El código no puede superar los 20 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Simbolo)
            .NotEmpty()
            .WithMessage("El símbolo es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El símbolo no puede superar los 20 caracteres.");

        RuleFor(x => x.Categoria)
            .NotEmpty()
            .MaximumLength(50);
    }
}

public sealed class CreateUnidadesMedidaRequestValidator
    : UnidadesMedidaRequestValidator<CreateUnidadesMedidaRequest>;

public sealed class UpdateUnidadesMedidaRequestValidator
    : UnidadesMedidaRequestValidator<UpdateUnidadesMedidaRequest>;