using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Profesiones;

public class CreateProfesionRequestValidator : AbstractValidator<CreateProfesionRequest>
{
    public CreateProfesionRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
