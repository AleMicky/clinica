using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Servicios.Tarifas.Validators;

public sealed class TarifarioDetalleCategoriaRequestValidator
    : AbstractValidator<TarifarioDetalleCategoriaRequest>
{
    public TarifarioDetalleCategoriaRequestValidator()
    {
        RuleFor(x => x.CategoriaServicioId)
            .GreaterThan(0)
            .WithMessage("La categoría de servicio es obligatoria.");
    }
}