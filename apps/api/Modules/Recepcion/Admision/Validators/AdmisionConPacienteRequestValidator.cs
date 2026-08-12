using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Validators;
using FluentValidation;

namespace Clinica.Api.Modules.Recepcion.Admision.Validators;

public sealed class CreateAdmisionConPacienteRequestValidator
    : AbstractValidator<CreateAdmisionConPacienteRequest>
{
    public CreateAdmisionConPacienteRequestValidator()
    {
        RuleFor(x => x.Paciente)
            .SetValidator(new CreatePacienteRequestValidator());

        RuleFor(x => x.Numero)
            .NotEmpty()
            .WithMessage("El número es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El número no puede superar los 20 caracteres.");

        RuleFor(x => x.FechaHora)
            .NotEmpty()
            .WithMessage("La fecha y hora son obligatorias.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("Debe incluir al menos un detalle de admisión.")
            .Must(detalles => detalles
                .Select(d => d.ServicioId)
                .Distinct()
                .Count() == detalles.Count)
            .WithMessage("No puede duplicar servicios dentro de la misma admisión.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new AdmisionDetalleRequestValidator<CreateAdmisionDetalleRequest>());
    }
}