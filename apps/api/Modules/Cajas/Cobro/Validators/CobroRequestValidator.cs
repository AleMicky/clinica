using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.Cobro.Validators;

public sealed class GenerarCobroDesdeVentaRequestValidator
    : AbstractValidator<GenerarCobroDesdeVentaRequest>
{
    public GenerarCobroDesdeVentaRequestValidator()
    {
        RuleFor(x => x.VentaPagadorId)
            .GreaterThan(0)
            .WithMessage("El pagador de la venta es obligatorio.");

        RuleFor(x => x.CajaId)
            .GreaterThan(0)
            .WithMessage("La caja es obligatoria.");
    }
}

public sealed class ConfirmarCobroRequestValidator
    : AbstractValidator<ConfirmarCobroRequest>
{
    public ConfirmarCobroRequestValidator()
    {
        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("Debe registrar al menos una forma de pago.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new CobroDetalleRequestValidator());
    }
}

public sealed class AnularCobroRequestValidator
    : AbstractValidator<AnularCobroRequest>
{
    public AnularCobroRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage(
                "El motivo de anulación no puede superar los 500 caracteres.");
    }
}