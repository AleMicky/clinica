using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Stock;

public sealed class MovimientoDetalleLineaRequestValidator : AbstractValidator<MovimientoDetalleLineaRequest>
{
    public MovimientoDetalleLineaRequestValidator()
    {
        RuleFor(x => x.ProductoId).NotEmpty();
        RuleFor(x => x.Cantidad).NotEqual(0);
    }
}

public sealed class RegistrarIngresoRequestValidator : AbstractValidator<RegistrarIngresoRequest>
{
    public RegistrarIngresoRequestValidator()
    {
        RuleFor(x => x.Lineas).NotEmpty();
        RuleForEach(x => x.Lineas).SetValidator(new MovimientoDetalleLineaRequestValidator());
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
    }
}

public sealed class RegistrarSalidaRequestValidator : AbstractValidator<RegistrarSalidaRequest>
{
    public RegistrarSalidaRequestValidator()
    {
        RuleFor(x => x.Lineas).NotEmpty();
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.ProductoId).NotEmpty();
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
    }
}

public sealed class RegistrarAjusteRequestValidator : AbstractValidator<RegistrarAjusteRequest>
{
    public RegistrarAjusteRequestValidator()
    {
        RuleFor(x => x.Lineas).NotEmpty();
        RuleForEach(x => x.Lineas).SetValidator(new MovimientoDetalleLineaRequestValidator());
    }
}

public sealed class RegistrarBajaRequestValidator : AbstractValidator<RegistrarBajaRequest>
{
    public RegistrarBajaRequestValidator()
    {
        RuleFor(x => x.Lineas).NotEmpty();
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.ProductoId).NotEmpty();
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
    }
}

public sealed class RegistrarTransferenciaRequestValidator : AbstractValidator<RegistrarTransferenciaRequest>
{
    public RegistrarTransferenciaRequestValidator()
    {
        RuleFor(x => x.Lineas).NotEmpty();
        RuleFor(x => x.AlmacenDestinoId).NotEmpty()
            .WithMessage("Debe indicar el almacén destino.");
        RuleForEach(x => x.Lineas).ChildRules(l =>
        {
            l.RuleFor(x => x.ProductoId).NotEmpty();
            l.RuleFor(x => x.Cantidad).GreaterThan(0);
        });
    }
}

public sealed class DescontarFefoRequestValidator : AbstractValidator<DescontarFefoRequest>
{
    public DescontarFefoRequestValidator()
    {
        RuleFor(x => x.ProductoId).NotEmpty();
        RuleFor(x => x.Cantidad).GreaterThan(0);
    }
}
