using FluentValidation;

namespace Clinica.Modules.Compras.Application.OrdenesCompra;

public sealed class CreateOrdenCompraRequestValidator : AbstractValidator<CreateOrdenCompraRequest>
{
    public CreateOrdenCompraRequestValidator()
    {
        RuleFor(x => x.ProveedorId).NotEmpty();
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.ProductoId).NotEmpty();
            d.RuleFor(x => x.Cantidad).GreaterThan(0);
            d.RuleFor(x => x.CostoUnitario).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed class RecibirOrdenRequestValidator : AbstractValidator<RecibirOrdenRequest>
{
    public RecibirOrdenRequestValidator()
    {
        RuleFor(x => x.Lineas).NotEmpty();
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.DetalleId).NotEmpty();
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
            l.RuleFor(x => x.NumeroLote).NotEmpty().MaximumLength(100);
        });
    }
}
