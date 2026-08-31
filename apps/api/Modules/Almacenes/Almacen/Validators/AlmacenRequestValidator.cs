using Clinica.Api.Modules.Almacenes.Almacen.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.Almacen.Validators;

public abstract class AlmacenRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : AlmacenRequest
{
    protected AlmacenRequestValidator()
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

        RuleFor(x => x.Ubicacion)
            .MaximumLength(250)
            .WithMessage("La ubicación no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Ubicacion));
    }
}

public sealed class CreateAlmacenRequestValidator
    : AlmacenRequestValidator<CreateAlmacenRequest>;

public sealed class UpdateAlmacenRequestValidator
    : AlmacenRequestValidator<UpdateAlmacenRequest>;
