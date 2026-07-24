using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Especialidades;

public class CreateEspecialidadRequestValidator : AbstractValidator<CreateEspecialidadRequest>
{
    public CreateEspecialidadRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.Orden).GreaterThanOrEqualTo(0);
    }
}
