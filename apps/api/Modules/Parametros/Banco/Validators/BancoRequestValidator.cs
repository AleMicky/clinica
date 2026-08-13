using Clinica.Api.Modules.Parametros.Banco.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Parametros.Banco.Validators;

public abstract class BancoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : BancoRequest
{
    protected BancoRequestValidator()
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

        RuleFor(x => x.NombreCorto)
            .MaximumLength(50)
            .WithMessage("El nombre corto no puede superar los 50 caracteres.");
    }
}

public sealed class CreateBancoRequestValidator
    : BancoRequestValidator<CreateBancoRequest>;

public sealed class UpdateBancoRequestValidator
    : BancoRequestValidator<UpdateBancoRequest>;
