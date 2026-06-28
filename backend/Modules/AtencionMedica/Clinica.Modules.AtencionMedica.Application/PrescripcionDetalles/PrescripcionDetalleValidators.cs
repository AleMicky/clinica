using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.PrescripcionDetalles;

public class CreatePrescripcionDetalleRequestValidator : AbstractValidator<CreatePrescripcionDetalleRequest>
{
    public CreatePrescripcionDetalleRequestValidator()
    {
        RuleFor(x => x.PrescripcionId).NotEmpty();
        RuleFor(x => x.MedicamentoNombre).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Dosis).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Frecuencia).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Duracion).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ViaAdministracion).MaximumLength(50);
        RuleFor(x => x.Indicaciones).MaximumLength(500);
    }
}

public class UpdatePrescripcionDetalleRequestValidator : AbstractValidator<UpdatePrescripcionDetalleRequest>
{
    public UpdatePrescripcionDetalleRequestValidator()
    {
        RuleFor(x => x.PrescripcionId).NotEmpty();
        RuleFor(x => x.MedicamentoNombre).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Dosis).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Frecuencia).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Duracion).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ViaAdministracion).MaximumLength(50);
        RuleFor(x => x.Indicaciones).MaximumLength(500);
    }
}
