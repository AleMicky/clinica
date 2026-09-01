using Clinica.Api.Modules.Almacenes.ReservaStock.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.ReservaStock.Validators;

public abstract class ReservaStockRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ReservaStockRequest
{
    protected ReservaStockRequestValidator()
    {
        RuleFor(x => x.Numero)
            .NotEmpty()
            .WithMessage("El número es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El número no puede superar los 20 caracteres.");

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.ReferenciaTipo)
            .NotEmpty()
            .WithMessage("El tipo de referencia es obligatorio.")
            .MaximumLength(30)
            .WithMessage("El tipo de referencia no puede superar los 30 caracteres.");

        RuleFor(x => x.FechaReserva)
            .NotEmpty()
            .WithMessage("La fecha de reserva es obligatoria.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La reserva debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new ReservaStockDetalleRequestValidator());
    }
}

public sealed class ReservaStockDetalleRequestValidator
    : AbstractValidator<ReservaStockDetalleRequest>
{
    public ReservaStockDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.CantidadReservada)
            .GreaterThan(0)
            .WithMessage("La cantidad reservada del detalle debe ser mayor que cero.");
    }
}

public sealed class CreateReservaStockRequestValidator
    : ReservaStockRequestValidator<CreateReservaStockRequest>;

public sealed class UpdateReservaStockRequestValidator
    : ReservaStockRequestValidator<UpdateReservaStockRequest>;

public sealed class ConsumirReservaStockRequestValidator
    : AbstractValidator<ConfirmarReservaStockRequest>
{
    public ConsumirReservaStockRequestValidator()
    {
        RuleFor(x => x.Cantidades)
            .NotEmpty()
            .WithMessage("Debe indicar la cantidad consumida de al menos un detalle.");

        RuleForEach(x => x.Cantidades)
            .SetValidator(new ReservaDetalleCantidadRequestValidator());
    }
}

public sealed class ReservaDetalleCantidadRequestValidator
    : AbstractValidator<ReservaDetalleCantidadRequest>
{
    public ReservaDetalleCantidadRequestValidator()
    {
        RuleFor(x => x.DetalleId)
            .GreaterThan(0)
            .WithMessage("El detalle es obligatorio.");

        RuleFor(x => x.CantidadConsumida)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad consumida no puede ser negativa.");
    }
}

public sealed class CancelarReservaStockRequestValidator
    : AbstractValidator<CancelarReservaStockRequest>
{
    public CancelarReservaStockRequestValidator()
    {
        RuleFor(x => x.MotivoCancelacion)
            .NotEmpty()
            .WithMessage("El motivo de cancelación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de cancelación no puede superar los 500 caracteres.");
    }
}
