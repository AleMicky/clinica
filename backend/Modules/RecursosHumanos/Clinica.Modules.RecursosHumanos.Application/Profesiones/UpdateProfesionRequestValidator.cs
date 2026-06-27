using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Profesiones;

public class UpdateProfesionRequestValidator : AbstractValidator<UpdateProfesionRequest>
{
    public UpdateProfesionRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
