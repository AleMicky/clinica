using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Prescripciones;

public class CreatePrescripcionRequestValidator : AbstractValidator<CreatePrescripcionRequest>
{
    public CreatePrescripcionRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}

public class UpdatePrescripcionRequestValidator : AbstractValidator<UpdatePrescripcionRequest>
{
    public UpdatePrescripcionRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
