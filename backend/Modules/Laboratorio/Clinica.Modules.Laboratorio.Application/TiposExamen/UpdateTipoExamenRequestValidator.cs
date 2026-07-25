using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.TiposExamen;

public class UpdateTipoExamenRequestValidator : AbstractValidator<UpdateTipoExamenRequest>
{
    public UpdateTipoExamenRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
