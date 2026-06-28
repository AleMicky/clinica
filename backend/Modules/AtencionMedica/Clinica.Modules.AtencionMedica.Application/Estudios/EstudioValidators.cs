using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Estudios;

public class CreateEstudioRequestValidator : AbstractValidator<CreateEstudioRequest>
{
    public CreateEstudioRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.TipoEstudioId).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Justificacion).MaximumLength(2000);
        RuleFor(x => x.Estado).NotEmpty().MaximumLength(30);
    }
}

public class UpdateEstudioRequestValidator : AbstractValidator<UpdateEstudioRequest>
{
    public UpdateEstudioRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.TipoEstudioId).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Justificacion).MaximumLength(2000);
        RuleFor(x => x.Estado).NotEmpty().MaximumLength(30);
    }
}
