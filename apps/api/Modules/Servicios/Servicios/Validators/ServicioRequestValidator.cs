using Clinica.Api.Modules.Servicios.Servicios.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Servicios.Servicios.Validators;

public abstract class ServicioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ServicioRequest
{
    protected ServicioRequestValidator()
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
    }
}

public sealed class CreateServicioRequestValidator : ServicioRequestValidator<CreateServicioRequest>;

public sealed class UpdateServicioRequestValidator : ServicioRequestValidator<UpdateServicioRequest>;