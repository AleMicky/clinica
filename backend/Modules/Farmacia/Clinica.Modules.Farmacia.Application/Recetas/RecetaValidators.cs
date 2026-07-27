using FluentValidation;

namespace Clinica.Modules.Farmacia.Application.Recetas;

public sealed class CreateRecetaRequestValidator : AbstractValidator<CreateRecetaRequest>
{
    public CreateRecetaRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.ProductoId).NotEmpty();
            d.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
    }
}
