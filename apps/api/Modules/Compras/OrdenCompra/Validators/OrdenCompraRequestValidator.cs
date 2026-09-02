using Clinica.Api.Modules.Compras.OrdenCompra.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Compras.OrdenCompra.Validators;

public abstract class OrdenCompraRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : OrdenCompraRequest
{
    protected OrdenCompraRequestValidator()
    {
        RuleFor(x => x.ProveedorId)
            .GreaterThan(0)
            .WithMessage("El proveedor es obligatorio.");

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.SolicitudCompraId)
            .GreaterThan(0)
            .WithMessage("La solicitud de compra debe tener un identificador válido.")
            .When(x => x.SolicitudCompraId.HasValue);

        RuleFor(x => x.CotizacionCompraId)
            .GreaterThan(0)
            .WithMessage("La cotización debe tener un identificador válido.")
            .When(x => x.CotizacionCompraId.HasValue);

        RuleFor(x => x.Fecha)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.");

        RuleFor(x => x.FechaEntregaEsperada)
            .GreaterThanOrEqualTo(x => x.Fecha)
            .WithMessage("La fecha de entrega esperada no puede ser anterior a la fecha de la orden.")
            .When(x => x.FechaEntregaEsperada.HasValue);

        RuleFor(x => x.CondicionPago)
            .MaximumLength(100)
            .WithMessage("La condición de pago no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.CondicionPago));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La orden de compra debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new OrdenCompraDetalleRequestValidator());
    }
}

public sealed class OrdenCompraDetalleRequestValidator
    : AbstractValidator<OrdenCompraDetalleRequest>
{
    public OrdenCompraDetalleRequestValidator()
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

public sealed class CreateOrdenCompraRequestValidator
    : OrdenCompraRequestValidator<CreateOrdenCompraRequest>;

public sealed class UpdateOrdenCompraRequestValidator
    : OrdenCompraRequestValidator<UpdateOrdenCompraRequest>;

public sealed class RecibirOrdenCompraRequestValidator
    : AbstractValidator<RecibirOrdenCompraRequest>
{
    public RecibirOrdenCompraRequestValidator()
    {
        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("Debe indicar al menos un detalle recibido.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new RecibirOrdenCompraDetalleRequestValidator());
    }
}

public sealed class RecibirOrdenCompraDetalleRequestValidator
    : AbstractValidator<RecibirOrdenCompraDetalleRequest>
{
    public RecibirOrdenCompraDetalleRequestValidator()
    {
        RuleFor(x => x.DetalleId)
            .GreaterThan(0)
            .WithMessage("El detalle es obligatorio.");

        RuleFor(x => x.CantidadRecibida)
            .GreaterThan(0)
            .WithMessage("La cantidad recibida del detalle debe ser mayor que cero.");
    }
}

public sealed class CancelarOrdenCompraRequestValidator
    : AbstractValidator<CancelarOrdenCompraRequest>
{
    public CancelarOrdenCompraRequestValidator()
    {
        RuleFor(x => x.MotivoCancelacion)
            .NotEmpty()
            .WithMessage("El motivo de cancelación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de cancelación no puede superar los 500 caracteres.");
    }
}
