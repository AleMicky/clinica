using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Interconsultas;

public class CreateInterconsultaRequestValidator : AbstractValidator<CreateInterconsultaRequest>
{
    public CreateInterconsultaRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.EspecialidadId).NotEmpty();
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Respuesta).MaximumLength(4000);
    }
}

public class UpdateInterconsultaRequestValidator : AbstractValidator<UpdateInterconsultaRequest>
{
    public UpdateInterconsultaRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.EspecialidadId).NotEmpty();
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Respuesta).MaximumLength(4000);
    }
}
