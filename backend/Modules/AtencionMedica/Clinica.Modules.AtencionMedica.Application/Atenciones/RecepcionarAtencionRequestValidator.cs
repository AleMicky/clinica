using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public class RecepcionarAtencionRequestValidator : AbstractValidator<RecepcionarAtencionRequest>
{
    public RecepcionarAtencionRequestValidator()
    {
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);

        RuleFor(x => x)
            .Must(x =>
                (x.PacienteId is { } id && id != Guid.Empty) ||
                x.PacienteNuevo is not null)
            .WithMessage("Debe indicar un paciente existente o los datos del paciente nuevo.");

        RuleFor(x => x)
            .Must(x =>
                !(x.PacienteId is { } id && id != Guid.Empty && x.PacienteNuevo is not null))
            .WithMessage("Indique solo paciente existente o paciente nuevo, no ambos.");

        When(x => x.PacienteNuevo is not null, () =>
        {
            RuleFor(x => x.PacienteNuevo!.TipoDocumentoId).NotEmpty();
            RuleFor(x => x.PacienteNuevo!.NumeroDocumento).NotEmpty().MaximumLength(20);
            RuleFor(x => x.PacienteNuevo!.Nombres).NotEmpty().MaximumLength(100);
            RuleFor(x => x.PacienteNuevo!.ApellidoPaterno).NotEmpty().MaximumLength(100);
            RuleFor(x => x.PacienteNuevo!.ApellidoMaterno).MaximumLength(100);
            RuleFor(x => x.PacienteNuevo!.SexoId).NotEmpty();
            RuleFor(x => x.PacienteNuevo!.EstadoCivilId).NotEmpty();
            RuleFor(x => x.PacienteNuevo!.Telefono).NotEmpty().MaximumLength(20);
            RuleFor(x => x.PacienteNuevo!.Direccion).MaximumLength(500);
            RuleFor(x => x.PacienteNuevo!.ComplementoDocumento).MaximumLength(10);
        });
    }
}
