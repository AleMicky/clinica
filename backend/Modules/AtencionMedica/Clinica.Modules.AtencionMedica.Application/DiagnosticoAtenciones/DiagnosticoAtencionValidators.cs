using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.DiagnosticoAtenciones;

public class CreateDiagnosticoAtencionRequestValidator : AbstractValidator<CreateDiagnosticoAtencionRequest>
{
    public CreateDiagnosticoAtencionRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.DiagnosticoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}

public class UpdateDiagnosticoAtencionRequestValidator : AbstractValidator<UpdateDiagnosticoAtencionRequest>
{
    public UpdateDiagnosticoAtencionRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.DiagnosticoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
