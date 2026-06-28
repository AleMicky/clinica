using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.SignosVitales;

public class CreateSignoVitalRequestValidator : AbstractValidator<CreateSignoVitalRequest>
{
    public CreateSignoVitalRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.Glasgow).InclusiveBetween(3, 15).When(x => x.Glasgow.HasValue);
    }
}

public class UpdateSignoVitalRequestValidator : AbstractValidator<UpdateSignoVitalRequest>
{
    public UpdateSignoVitalRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.Glasgow).InclusiveBetween(3, 15).When(x => x.Glasgow.HasValue);
    }
}
