using Clinica.Api.Modules.Seguridad.Usuarios.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Seguridad.Usuarios.Validators;

public abstract class UsuarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : UsuarioRequest
{
    protected UsuarioRequestValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("El nombre de usuario es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre de usuario no puede superar los 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress()
            .WithMessage("El correo electrónico no es válido.")
            .MaximumLength(256)
            .WithMessage("El correo electrónico no puede superar los 256 caracteres.");

        RuleFor(x => x.Persona)
            .NotNull()
            .WithMessage("Los datos de la persona son obligatorios.");

        When(x => x.Persona is not null, () =>
        {
            RuleFor(x => x.Persona.Nombres)
                .NotEmpty()
                .WithMessage("Los nombres son obligatorios.")
                .MaximumLength(100)
                .WithMessage("Los nombres no pueden superar los 100 caracteres.");

            RuleFor(x => x.Persona.ApellidoPaterno)
                .NotEmpty()
                .WithMessage("El apellido paterno es obligatorio.")
                .MaximumLength(50)
                .WithMessage("El apellido paterno no puede superar los 50 caracteres.");

            RuleFor(x => x.Persona.ApellidoMaterno)
                .MaximumLength(50)
                .WithMessage("El apellido materno no puede superar los 50 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.ApellidoMaterno));

            RuleFor(x => x.Persona.FechaNacimiento)
                .NotEqual(default(DateOnly))
                .WithMessage("La fecha de nacimiento es obligatoria.")
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("La fecha de nacimiento no puede ser futura.");

            RuleFor(x => x.Persona.Telefono)
                .MaximumLength(30)
                .WithMessage("El teléfono no puede superar los 30 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.Telefono));

            RuleFor(x => x.Persona.Direccion)
                .MaximumLength(250)
                .WithMessage("La dirección no puede superar los 250 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.Direccion));

            RuleFor(x => x.Persona.TipoDocumento)
                .NotEmpty()
                .WithMessage("El tipo de documento es obligatorio.")
                .MaximumLength(20)
                .WithMessage("El tipo de documento no puede superar los 20 caracteres.");

            RuleFor(x => x.Persona.NumeroDocumento)
                .NotEmpty()
                .WithMessage("El número de documento es obligatorio.")
                .MaximumLength(30)
                .WithMessage("El número de documento no puede superar los 30 caracteres.");

            RuleFor(x => x.Persona.ExtensionDocumento)
                .MaximumLength(10)
                .WithMessage("La extensión del documento no puede superar los 10 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.ExtensionDocumento));

            RuleFor(x => x.Persona.ComplementoDocumento)
                .MaximumLength(10)
                .WithMessage("El complemento del documento no puede superar los 10 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.ComplementoDocumento));

            RuleFor(x => x.Persona.Genero)
                .MaximumLength(20)
                .WithMessage("El género no puede superar los 20 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.Genero));

            RuleFor(x => x.Persona.EstadoCivil)
                .MaximumLength(20)
                .WithMessage("El estado civil no puede superar los 20 caracteres.")
                .When(x => !string.IsNullOrWhiteSpace(x.Persona.EstadoCivil));
        });

        RuleFor(x => x.Roles)
            .NotNull()
            .WithMessage("La lista de roles es obligatoria.");

        RuleForEach(x => x.Roles)
            .NotEmpty()
            .WithMessage("El nombre del rol no puede estar vacío.")
            .MaximumLength(256)
            .WithMessage("El nombre del rol no puede superar los 256 caracteres.");
    }
}

public sealed class CreateUsuarioRequestValidator
    : UsuarioRequestValidator<CreateUsuarioRequest>
{
    public CreateUsuarioRequestValidator()
    {
        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("La contraseña es obligatoria.")
            .MinimumLength(6)
            .WithMessage("La contraseña debe tener al menos 6 caracteres.")
            .MaximumLength(100)
            .WithMessage("La contraseña no puede superar los 100 caracteres.");
    }
}