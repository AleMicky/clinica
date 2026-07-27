using FluentValidation;

namespace Clinica.Modules.Caja.Application.Pagos;

public sealed class RegistrarPagoRequestValidator : AbstractValidator<RegistrarPagoRequest>
{
    public RegistrarPagoRequestValidator()
    {
        RuleFor(x => x.CuentaId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).SetValidator(new RegistrarPagoDetalleRequestValidator());
    }
}

public sealed class RegistrarPagoDetalleRequestValidator : AbstractValidator<RegistrarPagoDetalleRequest>
{
    public RegistrarPagoDetalleRequestValidator()
    {
        RuleFor(x => x.MetodoPagoId).NotEmpty();
        RuleFor(x => x.Importe).GreaterThan(0);
        RuleFor(x => x.NumeroReferencia).MaximumLength(100);
        RuleFor(x => x.Observaciones).MaximumLength(1000);
    }
}

public sealed class AnularPagoRequestValidator : AbstractValidator<AnularPagoRequest>
{
    public AnularPagoRequestValidator()
    {
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(2000);
    }
}
