using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Validators;

public sealed class AbrirTurnoCajaRequestValidator
    : AbstractValidator<AbrirTurnoCajaRequest>
{
    public AbrirTurnoCajaRequestValidator()
    {
        RuleFor(x => x.CajaId)
            .GreaterThan(0);

        RuleFor(x => x.EmpleadoId)
            .GreaterThan(0);

        RuleFor(x => x.MontoInicial)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Observacion)
            .MaximumLength(500);
    }
}