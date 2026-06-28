using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.ResultadosEstudio;

public class CreateResultadoEstudioRequestValidator : AbstractValidator<CreateResultadoEstudioRequest>
{
    public CreateResultadoEstudioRequestValidator()
    {
        RuleFor(x => x.EstudioId).NotEmpty();
        RuleFor(x => x.ResultadoTexto).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.ArchivoUrl).MaximumLength(500);
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}

public class UpdateResultadoEstudioRequestValidator : AbstractValidator<UpdateResultadoEstudioRequest>
{
    public UpdateResultadoEstudioRequestValidator()
    {
        RuleFor(x => x.EstudioId).NotEmpty();
        RuleFor(x => x.ResultadoTexto).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.ArchivoUrl).MaximumLength(500);
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
