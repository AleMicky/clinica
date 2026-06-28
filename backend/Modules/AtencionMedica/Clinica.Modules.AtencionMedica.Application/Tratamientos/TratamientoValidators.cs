using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Tratamientos;

public class CreateTratamientoRequestValidator : AbstractValidator<CreateTratamientoRequest>
{
    public CreateTratamientoRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.Descripcion).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Indicaciones).MaximumLength(2000);
    }
}

public class UpdateTratamientoRequestValidator : AbstractValidator<UpdateTratamientoRequest>
{
    public UpdateTratamientoRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.Descripcion).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Indicaciones).MaximumLength(2000);
    }
}
