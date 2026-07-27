using FluentValidation;

namespace Clinica.Modules.Farmacia.Application.Dispensaciones;

public sealed class CreateDispensacionRequestValidator : AbstractValidator<CreateDispensacionRequest>
{
    public CreateDispensacionRequestValidator()
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
