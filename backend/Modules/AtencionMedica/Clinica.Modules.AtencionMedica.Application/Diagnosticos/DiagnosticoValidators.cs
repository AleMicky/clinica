using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Diagnosticos;

public class CreateDiagnosticoRequestValidator : AbstractValidator<CreateDiagnosticoRequest>
{
    public CreateDiagnosticoRequestValidator()
    {
        RuleFor(x => x.CodigoCie10).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Descripcion).MaximumLength(2000);
    }
}

public class UpdateDiagnosticoRequestValidator : AbstractValidator<UpdateDiagnosticoRequest>
{
    public UpdateDiagnosticoRequestValidator()
    {
        RuleFor(x => x.CodigoCie10).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Descripcion).MaximumLength(2000);
    }
}
