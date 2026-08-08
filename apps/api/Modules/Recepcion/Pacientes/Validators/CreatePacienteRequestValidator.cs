using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Validators;

public sealed class CreatePacienteRequestValidator
    : AbstractValidator<CreatePacienteRequest>

{
    public CreatePacienteRequestValidator()

    {
        RuleFor(x => x.Nombres)
            .NotEmpty()
            .WithMessage("Los nombres son obligatorios.")
            .MaximumLength(100);

        RuleFor(x => x.ApellidoPaterno)
            .NotEmpty()
            .WithMessage("El apellido paterno es obligatorio.")
            .MaximumLength(50);

        RuleFor(x => x.ApellidoMaterno)
            .MaximumLength(50)
            .When(x =>
                !string.IsNullOrWhiteSpace(
                    x.ApellidoMaterno));

        RuleFor(x => x.FechaNacimiento)
            .NotEmpty()
            .WithMessage(
                "La fecha de nacimiento es obligatoria.")
            .LessThanOrEqualTo(
                DateOnly.FromDateTime(DateTime.Today))
            .WithMessage(
                "La fecha de nacimiento no puede ser futura.");

        RuleFor(x => x.Telefono)
            .MaximumLength(30)
            .When(x =>
                !string.IsNullOrWhiteSpace(x.Telefono));

        RuleFor(x => x.Direccion)
            .MaximumLength(200)
            .When(x =>
                !string.IsNullOrWhiteSpace(x.Direccion));

        RuleFor(x => x.TipoDocumento)
            .NotEmpty()
            .WithMessage(
                "El tipo de documento es obligatorio.")
            .MaximumLength(20);

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty()
            .WithMessage(
                "El número de documento es obligatorio.")
            .MaximumLength(20);

        RuleFor(x => x.ExtensionDocumento)
            .MaximumLength(5)
            .When(x =>
                !string.IsNullOrWhiteSpace(
                    x.ExtensionDocumento));

        RuleFor(x => x.ComplementoDocumento)
            .MaximumLength(10)
            .When(x =>
                !string.IsNullOrWhiteSpace(
                    x.ComplementoDocumento));

        RuleFor(x => x.Genero)
            .MaximumLength(20)
            .When(x =>
                !string.IsNullOrWhiteSpace(x.Genero));

        RuleFor(x => x.EstadoCivil)
            .MaximumLength(20)
            .When(x =>
                !string.IsNullOrWhiteSpace(
                    x.EstadoCivil));
    }
}