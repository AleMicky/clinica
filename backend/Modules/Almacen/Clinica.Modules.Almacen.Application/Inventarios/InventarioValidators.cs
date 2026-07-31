using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Inventarios;

public sealed class CreateInventarioFisicoRequestValidator : AbstractValidator<CreateInventarioFisicoRequest>
{
    public CreateInventarioFisicoRequestValidator()
    {
        RuleFor(x => x.AlmacenId).NotEmpty();
    }
}

public sealed class ContarInventarioRequestValidator : AbstractValidator<ContarInventarioRequest>
{
    public ContarInventarioRequestValidator()
    {
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.ProductoId).NotEmpty();
            d.RuleFor(x => x.CantidadContada).GreaterThanOrEqualTo(0);
        });
    }
}
