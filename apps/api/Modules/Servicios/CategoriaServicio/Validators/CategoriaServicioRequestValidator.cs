using Clinica.Api.Modules.Servicios.CategoriaServicio.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Servicios.CategoriaServicio.Validators;

public abstract class CategoriaServicioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CategoriaServicioRequest
{
    protected CategoriaServicioRequestValidator()
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

public sealed class CreateCategoriaServicioRequestValidator
    : CategoriaServicioRequestValidator<CreateCategoriaServicioRequest>;

public sealed class UpdateCategoriaServicioRequestValidator
    : CategoriaServicioRequestValidator<UpdateCategoriaServicioRequest>;