using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Recepcion;

public sealed class CrearRecepcionAtencionRequestValidator
    : AbstractValidator<CrearRecepcionAtencionRequest>
{
    public CrearRecepcionAtencionRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.ServicioId).NotEmpty();
        RuleFor(x => x.MotivoConsulta).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ResponsableFinancieroNombre).MaximumLength(200);
        RuleFor(x => x.ResponsableFinancieroDocumento).MaximumLength(50);
        RuleFor(x => x.ResponsableFinancieroTelefono).MaximumLength(30);
        RuleFor(x => x.SeguroNombre).MaximumLength(200);
        RuleFor(x => x.NumeroAfiliacion).MaximumLength(50);
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
