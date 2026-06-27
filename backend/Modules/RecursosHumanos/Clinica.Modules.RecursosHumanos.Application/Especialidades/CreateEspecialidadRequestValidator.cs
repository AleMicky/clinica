using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Especialidades;

public class CreateEspecialidadRequestValidator : AbstractValidator<CreateEspecialidadRequest>
{
    public CreateEspecialidadRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
