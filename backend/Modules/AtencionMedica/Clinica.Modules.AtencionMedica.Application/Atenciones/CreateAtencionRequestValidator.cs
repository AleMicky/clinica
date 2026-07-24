using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public class CreateAtencionRequestValidator : AbstractValidator<CreateAtencionRequest>
{
    public CreateAtencionRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.FormularioClinicoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
