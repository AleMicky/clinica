using FluentValidation;

namespace Clinica.Modules.Caja.Application.Turnos;

public sealed class AbrirTurnoCajaRequestValidator : AbstractValidator<AbrirTurnoCajaRequest>
{
    public AbrirTurnoCajaRequestValidator()
    {
        RuleFor(x => x.CajaId).NotEmpty();
        RuleFor(x => x.MontoInicial).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ObservacionApertura).MaximumLength(2000);
    }
}

public sealed class CerrarTurnoCajaRequestValidator : AbstractValidator<CerrarTurnoCajaRequest>
{
    public CerrarTurnoCajaRequestValidator()
    {
        RuleFor(x => x.MontoContado).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ObservacionCierre).MaximumLength(2000);
    }
}
