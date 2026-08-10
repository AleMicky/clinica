using Clinica.Api.Modules.Seguridad.Personas.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Seguridad.Personas.Validators;

public abstract class PersonaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : PersonaRequest
{
    protected PersonaRequestValidator()
    {
        RuleFor(x => x.Nombres)
            .NotEmpty()
            .WithMessage("Los nombres son obligatorios.")
            .MaximumLength(100)
            .WithMessage("Los nombres no pueden superar los 100 caracteres.");

        RuleFor(x => x.ApellidoPaterno)
            .NotEmpty()
            .WithMessage("El apellido paterno es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El apellido paterno no puede superar los 100 caracteres.");

        RuleFor(x => x.ApellidoMaterno)
            .MaximumLength(100)
            .WithMessage("El apellido materno no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.ApellidoMaterno));

        RuleFor(x => x.FechaNacimiento)
            .NotEmpty()
            .WithMessage("La fecha de nacimiento es obligatoria.")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de nacimiento no puede ser mayor a la fecha actual.");

        RuleFor(x => x.Telefono)
            .MaximumLength(20)
            .WithMessage("El teléfono no puede superar los 20 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Telefono));

        RuleFor(x => x.Direccion)
            .MaximumLength(250)
            .WithMessage("La dirección no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Direccion));

        RuleFor(x => x.TipoDocumento)
            .NotEmpty()
            .WithMessage("El tipo de documento es obligatorio.")
            .MaximumLength(30)
            .WithMessage("El tipo de documento no puede superar los 30 caracteres.");

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty()
            .WithMessage("El número de documento es obligatorio.")
            .MaximumLength(30)
            .WithMessage("El número de documento no puede superar los 30 caracteres.");

        RuleFor(x => x.ExtensionDocumento)
            .MaximumLength(10)
            .WithMessage("La extensión del documento no puede superar los 10 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.ExtensionDocumento));

        RuleFor(x => x.ComplementoDocumento)
            .MaximumLength(10)
            .WithMessage("El complemento del documento no puede superar los 10 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.ComplementoDocumento));

        RuleFor(x => x.Genero)
            .MaximumLength(20)
            .WithMessage("El género no puede superar los 20 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Genero));

        RuleFor(x => x.EstadoCivil)
            .MaximumLength(30)
            .WithMessage("El estado civil no puede superar los 30 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.EstadoCivil));
    }
}

public sealed class CreatePersonaRequestValidator : PersonaRequestValidator<CreatePersonaRequest>;

public sealed class UpdatePersonaRequestValidator : PersonaRequestValidator<UpdatePersonaRequest>;