using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Validators;

public abstract class MovimientoInventarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : MovimientoInventarioRequest
{
    protected MovimientoInventarioRequestValidator()
    {
        RuleFor(x => x.Numero)
            .NotEmpty()
            .WithMessage("El número es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El número no puede superar los 20 caracteres.");

        RuleFor(x => x.TipoMovimientoInventarioId)
            .GreaterThan(0)
            .WithMessage("El tipo de movimiento es obligatorio.");

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.ReferenciaTipo)
            .MaximumLength(30)
            .WithMessage("El tipo de referencia no puede superar los 30 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.ReferenciaTipo));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("El movimiento debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new MovimientoInventarioDetalleRequestValidator());
    }
}

public sealed class MovimientoInventarioDetalleRequestValidator
    : AbstractValidator<MovimientoInventarioDetalleRequest>
{
    public MovimientoInventarioDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad del detalle debe ser mayor que cero.");

        RuleFor(x => x.CostoUnitario)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo unitario del detalle no puede ser negativo.")
            .When(x => x.CostoUnitario.HasValue);
    }
}

public sealed class CreateMovimientoInventarioRequestValidator
    : MovimientoInventarioRequestValidator<CreateMovimientoInventarioRequest>;

public sealed class UpdateMovimientoInventarioRequestValidator
    : MovimientoInventarioRequestValidator<UpdateMovimientoInventarioRequest>;

public sealed class AnularMovimientoInventarioRequestValidator
    : AbstractValidator<AnularMovimientoInventarioRequest>
{
    public AnularMovimientoInventarioRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}
