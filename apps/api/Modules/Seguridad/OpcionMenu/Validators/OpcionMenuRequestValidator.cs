using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Validators;


public abstract class OpcionMenuRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : OpcionMenuRequest
{
    protected OpcionMenuRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El código no puede superar los 100 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(150)
            .WithMessage("El nombre no puede superar los 150 caracteres.");

        RuleFor(x => x.Ruta)
            .MaximumLength(250)
            .WithMessage("La ruta no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Ruta));

        RuleFor(x => x.Icono)
            .MaximumLength(100)
            .WithMessage("El icono no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Icono));

        RuleFor(x => x.Orden)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El orden no puede ser menor a 0.");

        RuleFor(x => x.PadreId)
            .GreaterThan(0)
            .WithMessage("El identificador del menú padre debe ser mayor a 0.")
            .When(x => x.PadreId.HasValue);
    }
}

public sealed class CreateOpcionMenuRequestValidator
    : OpcionMenuRequestValidator<CreateOpcionMenuRequest>;

public sealed class UpdateOpcionMenuRequestValidator
    : OpcionMenuRequestValidator<UpdateOpcionMenuRequest>;