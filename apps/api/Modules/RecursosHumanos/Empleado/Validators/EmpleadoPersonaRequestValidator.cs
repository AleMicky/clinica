using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Validators;

public sealed class EmpleadoPersonaRequestValidator
    : AbstractValidator<EmpleadoPersonaRequest>
{
    public EmpleadoPersonaRequestValidator()
    {
        RuleFor(x => x.FechaIngreso)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de ingreso no puede ser futura.");

        RuleFor(x => x.FechaRetiro)
            .GreaterThanOrEqualTo(x => x.FechaIngreso)
            .WithMessage("La fecha de retiro no puede ser anterior a la fecha de ingreso.")
            .When(x => x.FechaRetiro.HasValue);

        RuleFor(x => x.Persona)
            .NotNull()
            .WithMessage("Los datos de la persona son obligatorios.")
            .SetValidator(new PersonaCreateDtoValidator());
    }
}

public sealed class PersonaCreateDtoValidator
    : AbstractValidator<PersonaCreateDto>
{
    public PersonaCreateDtoValidator()
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
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("La fecha de nacimiento debe ser anterior a la fecha actual.");

        RuleFor(x => x.Telefono)
            .MaximumLength(20)
            .WithMessage("El teléfono no puede superar los 20 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Telefono));

        RuleFor(x => x.Direccion)
            .MaximumLength(255)
            .WithMessage("La dirección no puede superar los 255 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Direccion));

        RuleFor(x => x.TipoDocumento)
            .NotEmpty()
            .WithMessage("El tipo de documento es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El tipo de documento no puede superar los 20 caracteres.");

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
            .MaximumLength(20)
            .WithMessage("El estado civil no puede superar los 20 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.EstadoCivil));
    }
}