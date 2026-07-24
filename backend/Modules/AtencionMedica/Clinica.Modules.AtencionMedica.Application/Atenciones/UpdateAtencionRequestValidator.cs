using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public class UpdateAtencionRequestValidator : AbstractValidator<UpdateAtencionRequest>
{
    public UpdateAtencionRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.FormularioClinicoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
