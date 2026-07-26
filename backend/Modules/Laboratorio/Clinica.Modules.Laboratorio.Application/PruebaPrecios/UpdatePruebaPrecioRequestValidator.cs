using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.PruebaPrecios;

public class UpdatePruebaPrecioRequestValidator : AbstractValidator<UpdatePruebaPrecioRequest>
{
    public UpdatePruebaPrecioRequestValidator()
    {
        RuleFor(x => x.PruebaId).NotEmpty();
        RuleFor(x => x.ImporteFacturado).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CostoLaboratorio).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CostoDerivacion).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FechaInicio).NotEmpty();
        RuleFor(x => x.MotivoCambio).NotEmpty().MaximumLength(300);

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .When(x => x.FechaFin.HasValue)
            .WithMessage("La fecha fin debe ser mayor o igual a la fecha inicio.");
    }
}
