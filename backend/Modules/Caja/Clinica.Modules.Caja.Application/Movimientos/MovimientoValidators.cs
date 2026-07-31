using FluentValidation;

namespace Clinica.Modules.Caja.Application.Movimientos;

public sealed class RegistrarMovimientoCajaRequestValidator : AbstractValidator<RegistrarMovimientoCajaRequest>
{
    public RegistrarMovimientoCajaRequestValidator()
    {
        RuleFor(x => x.ConceptoCajaId).NotEmpty();
        RuleFor(x => x.Importe).GreaterThan(0);
        RuleFor(x => x.NumeroReferencia).MaximumLength(100);
        RuleFor(x => x.Descripcion).MaximumLength(2000);
    }
}
