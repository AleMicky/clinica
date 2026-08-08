using Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Validators;

public abstract class EspecialidadRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : EspecialidadRequest
{
    protected EspecialidadRequestValidator()
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

public sealed class CreateEspecialidadRequestValidator
    : EspecialidadRequestValidator<CreateEspecialidadRequest>;

public sealed class UpdateEspecialidadRequestValidator
    : EspecialidadRequestValidator<UpdateEspecialidadRequest>;
