using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Cargos;

public class CreateCargoRequestValidator : AbstractValidator<CreateCargoRequest>
{
    public CreateCargoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
