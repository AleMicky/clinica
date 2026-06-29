using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public class CreateAtencionRequestValidator : AbstractValidator<CreateAtencionRequest>
{
    public CreateAtencionRequestValidator()
    {
        RuleFor(x => x.NumeroAtencion).NotEmpty().MaximumLength(30);
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.FormularioClinicoId).NotEmpty();
        RuleFor(x => x.Estado).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
