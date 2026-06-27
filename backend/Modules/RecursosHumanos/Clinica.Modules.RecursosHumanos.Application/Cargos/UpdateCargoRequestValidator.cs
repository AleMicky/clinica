using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Cargos;

public class UpdateCargoRequestValidator : AbstractValidator<UpdateCargoRequest>
{
    public UpdateCargoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
