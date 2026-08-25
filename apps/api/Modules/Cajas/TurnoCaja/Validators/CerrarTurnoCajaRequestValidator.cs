using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Validators;

public sealed class CerrarTurnoCajaRequestValidator
    : AbstractValidator<CerrarTurnoCajaRequest>
{
    public CerrarTurnoCajaRequestValidator()
    {
        RuleFor(x => x.Observacion)
            .MaximumLength(500);
    }
}