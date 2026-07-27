using FluentValidation;

namespace Clinica.Modules.Farmacia.Application.Precios;

public sealed class CreatePrecioRequestValidator : AbstractValidator<CreatePrecioRequest>
{
    public CreatePrecioRequestValidator()
    {
        RuleFor(x => x.ProductoId).NotEmpty();
        RuleFor(x => x.Importe).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FechaInicio).NotEmpty();
        RuleFor(x => x.FechaFin).GreaterThanOrEqualTo(x => x.FechaInicio).When(x => x.FechaFin.HasValue);
        RuleFor(x => x.MotivoCambio).MaximumLength(500);
    }
}

public sealed class UpdatePrecioRequestValidator : AbstractValidator<UpdatePrecioRequest>
{
    public UpdatePrecioRequestValidator()
    {
        RuleFor(x => x.Importe).GreaterThanOrEqualTo(0);
        RuleFor(x => x.FechaInicio).NotEmpty();
        RuleFor(x => x.FechaFin).GreaterThanOrEqualTo(x => x.FechaInicio).When(x => x.FechaFin.HasValue);
        RuleFor(x => x.MotivoCambio).MaximumLength(500);
    }
}
