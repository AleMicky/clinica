using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public class UpdateAreaRequestValidator : AbstractValidator<UpdateAreaRequest>
{
    public UpdateAreaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.TipoAreaId).NotEmpty();
        RuleFor(x => x.AreaPadreId)
            .Must(id => id is null || id != Guid.Empty)
            .WithMessage("El área padre no es válida.");
        RuleFor(x => x.ResponsableEmpleadoId)
            .Must(id => id is null || id != Guid.Empty)
            .WithMessage("El responsable no es válido.");
    }
}
