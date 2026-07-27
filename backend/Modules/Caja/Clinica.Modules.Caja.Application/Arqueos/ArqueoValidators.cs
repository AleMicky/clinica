using FluentValidation;

namespace Clinica.Modules.Caja.Application.Arqueos;

public sealed class CerrarArqueoCajaRequestValidator : AbstractValidator<CerrarArqueoCajaRequest>
{
    public CerrarArqueoCajaRequestValidator()
    {
        RuleFor(x => x.MontoContado).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}
