using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Areas;

public class UpdateAreaRequestValidator : AbstractValidator<UpdateAreaRequest>
{
    public UpdateAreaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
