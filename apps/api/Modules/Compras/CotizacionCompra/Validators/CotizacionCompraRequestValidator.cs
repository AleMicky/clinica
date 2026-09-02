using Clinica.Api.Modules.Compras.CotizacionCompra.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Validators;

public abstract class CotizacionCompraRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CotizacionCompraRequest
{
    protected CotizacionCompraRequestValidator()
    {
        RuleFor(x => x.ProveedorId)
            .GreaterThan(0)
            .WithMessage("El proveedor es obligatorio.");

        RuleFor(x => x.SolicitudCompraId)
            .GreaterThan(0)
            .WithMessage("La solicitud de compra debe tener un identificador válido.")
            .When(x => x.SolicitudCompraId.HasValue);

        RuleFor(x => x.Fecha)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.");

        RuleFor(x => x.FechaVencimiento)
            .GreaterThanOrEqualTo(x => x.Fecha)
            .WithMessage("La fecha de vencimiento no puede ser anterior a la fecha de la cotización.")
            .When(x => x.FechaVencimiento.HasValue);

        RuleFor(x => x.CondicionPago)
            .MaximumLength(100)
            .WithMessage("La condición de pago no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.CondicionPago));

        RuleFor(x => x.TiempoEntrega)
            .MaximumLength(100)
            .WithMessage("El tiempo de entrega no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.TiempoEntrega));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La cotización debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new CotizacionCompraDetalleRequestValidator());
    }
}

public sealed class CotizacionCompraDetalleRequestValidator
    : AbstractValidator<CotizacionCompraDetalleRequest>
{
    public CotizacionCompraDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad del detalle debe ser mayor que cero.");

        RuleFor(x => x.PrecioUnitario)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El precio unitario no puede ser negativo.");

        RuleFor(x => x.Descuento)
            .InclusiveBetween(0, 100)
            .WithMessage("El descuento debe estar entre 0 y 100.");

        RuleFor(x => x.Observacion)
            .MaximumLength(250)
            .WithMessage("La observación del detalle no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateCotizacionCompraRequestValidator
    : CotizacionCompraRequestValidator<CreateCotizacionCompraRequest>;

public sealed class UpdateCotizacionCompraRequestValidator
    : CotizacionCompraRequestValidator<UpdateCotizacionCompraRequest>;

public sealed class CancelarCotizacionCompraRequestValidator
    : AbstractValidator<CancelarCotizacionCompraRequest>
{
    public CancelarCotizacionCompraRequestValidator()
    {
        RuleFor(x => x.MotivoCancelacion)
            .NotEmpty()
            .WithMessage("El motivo de cancelación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de cancelación no puede superar los 500 caracteres.");
    }
}
