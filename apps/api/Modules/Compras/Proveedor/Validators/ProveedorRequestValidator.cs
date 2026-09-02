using Clinica.Api.Modules.Compras.Proveedor.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Compras.Proveedor.Validators;

public abstract class ProveedorRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ProveedorRequest
{
    protected ProveedorRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El código no puede superar los 20 caracteres.");

        RuleFor(x => x.RazonSocial)
            .NotEmpty()
            .WithMessage("La razón social es obligatoria.")
            .MaximumLength(150)
            .WithMessage("La razón social no puede superar los 150 caracteres.");

        RuleFor(x => x.NombreComercial)
            .MaximumLength(150)
            .WithMessage("El nombre comercial no puede superar los 150 caracteres.");

        RuleFor(x => x.Nit)
            .MaximumLength(20)
            .WithMessage("El NIT no puede superar los 20 caracteres.");

        RuleFor(x => x.Direccion)
            .MaximumLength(250)
            .WithMessage("La dirección no puede superar los 250 caracteres.");

        RuleFor(x => x.Telefono)
            .MaximumLength(20)
            .WithMessage("El teléfono no puede superar los 20 caracteres.");

        RuleFor(x => x.Celular)
            .MaximumLength(20)
            .WithMessage("El celular no puede superar los 20 caracteres.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage("El correo electrónico no es válido.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Contacto)
            .MaximumLength(100)
            .WithMessage("El contacto no puede superar los 100 caracteres.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.");
    }
}

public sealed class CreateProveedorRequestValidator
    : ProveedorRequestValidator<CreateProveedorRequest>;

public sealed class UpdateProveedorRequestValidator
    : ProveedorRequestValidator<UpdateProveedorRequest>;
