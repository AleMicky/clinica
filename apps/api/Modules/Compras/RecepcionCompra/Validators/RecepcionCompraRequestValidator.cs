using Clinica.Api.Modules.Compras.RecepcionCompra.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Validators;

public abstract class RecepcionCompraRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : RecepcionCompraRequest
{
    protected RecepcionCompraRequestValidator()
    {
        RuleFor(x => x.OrdenCompraId)
            .GreaterThan(0)
            .WithMessage("La orden de compra es obligatoria.");

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.FechaRecepcion)
            .NotEmpty()
            .WithMessage("La fecha de recepción es obligatoria.");

        RuleFor(x => x.NumeroFactura)
            .MaximumLength(50)
            .WithMessage("El número de factura no puede superar los 50 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.NumeroFactura));

        RuleFor(x => x.NumeroRemision)
            .MaximumLength(50)
            .WithMessage("El número de remisión no puede superar los 50 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.NumeroRemision));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La recepción debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new RecepcionCompraDetalleRequestValidator());
    }
}

public sealed class RecepcionCompraDetalleRequestValidator
    : AbstractValidator<RecepcionCompraDetalleRequest>
{
    public RecepcionCompraDetalleRequestValidator()
    {
        RuleFor(x => x.OrdenCompraDetalleId)
            .GreaterThan(0)
            .WithMessage("El detalle de la orden de compra es obligatorio.");

        RuleFor(x => x.CantidadRecibida)
            .GreaterThan(0)
            .WithMessage("La cantidad recibida del detalle debe ser mayor que cero.");

        RuleFor(x => x.LoteId)
            .GreaterThan(0)
            .WithMessage("El lote debe tener un identificador válido.")
            .When(x => x.LoteId.HasValue);

        RuleFor(x => x.PrecioUnitario)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El precio unitario no puede ser negativo.");

        RuleFor(x => x.Observacion)
            .MaximumLength(250)
            .WithMessage("La observación del detalle no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateRecepcionCompraRequestValidator
    : RecepcionCompraRequestValidator<CreateRecepcionCompraRequest>;

public sealed class UpdateRecepcionCompraRequestValidator
    : RecepcionCompraRequestValidator<UpdateRecepcionCompraRequest>;

public sealed class AnularRecepcionCompraRequestValidator
    : AbstractValidator<AnularRecepcionCompraRequest>
{
    public AnularRecepcionCompraRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}
