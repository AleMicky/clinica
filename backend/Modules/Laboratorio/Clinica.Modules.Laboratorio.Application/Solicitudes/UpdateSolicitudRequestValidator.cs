using Clinica.Modules.Laboratorio.Domain.Constants;
using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public class UpdateSolicitudRequestValidator : AbstractValidator<UpdateSolicitudRequest>
{
    public UpdateSolicitudRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();

        RuleFor(x => x.Origen)
            .NotEmpty()
            .Must(o => SolicitudOrigenes.All.Contains(o))
            .WithMessage($"Origen debe ser uno de: {string.Join(", ", SolicitudOrigenes.All)}.");

        RuleFor(x => x.MedicoExternoNombre).MaximumLength(200);
        RuleFor(x => x.Observaciones).MaximumLength(2000);

        RuleFor(x => x.AtencionId)
            .NotEmpty()
            .When(x => x.Origen == SolicitudOrigenes.AtencionMedica)
            .WithMessage("Debe indicar la atención de origen.");

        RuleFor(x => x.MedicoExternoNombre)
            .NotEmpty()
            .When(x => x.Origen == SolicitudOrigenes.MedicoExterno)
            .WithMessage("Debe indicar el nombre del médico externo.");

        RuleFor(x => x.Lineas)
            .NotEmpty()
            .WithMessage("Debe incluir al menos una línea de solicitud.");

        RuleForEach(x => x.Lineas).SetValidator(new CreateSolicitudLineaRequestValidator());
    }
}
