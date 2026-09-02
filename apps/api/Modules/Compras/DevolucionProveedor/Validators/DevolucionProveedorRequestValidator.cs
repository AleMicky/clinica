using Clinica.Api.Modules.Compras.DevolucionProveedor.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Validators;

public abstract class DevolucionProveedorRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : DevolucionProveedorRequest
{
    protected DevolucionProveedorRequestValidator()
    {
        RuleFor(x => x.ProveedorId)
            .GreaterThan(0)
            .WithMessage("El proveedor es obligatorio.");

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.RecepcionCompraId)
            .GreaterThan(0)
            .WithMessage("La recepción debe tener un identificador válido.")
            .When(x => x.RecepcionCompraId.HasValue);

        RuleFor(x => x.Fecha)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.");

        RuleFor(x => x.Motivo)
            .NotEmpty()
            .WithMessage("El motivo es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo no puede superar los 500 caracteres.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La devolución debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new DevolucionProveedorDetalleRequestValidator());
    }
}

public sealed class DevolucionProveedorDetalleRequestValidator
    : AbstractValidator<DevolucionProveedorDetalleRequest>
{
    public DevolucionProveedorDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.LoteId)
            .GreaterThan(0)
            .WithMessage("El lote debe tener un identificador válido.")
            .When(x => x.LoteId.HasValue);

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad del detalle debe ser mayor que cero.");

        RuleFor(x => x.Motivo)
            .MaximumLength(500)
            .WithMessage("El motivo del detalle no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Motivo));

        RuleFor(x => x.Observacion)
            .MaximumLength(250)
            .WithMessage("La observación del detalle no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateDevolucionProveedorRequestValidator
    : DevolucionProveedorRequestValidator<CreateDevolucionProveedorRequest>;

public sealed class UpdateDevolucionProveedorRequestValidator
    : DevolucionProveedorRequestValidator<UpdateDevolucionProveedorRequest>;

public sealed class AnularDevolucionProveedorRequestValidator
    : AbstractValidator<AnularDevolucionProveedorRequest>
{
    public AnularDevolucionProveedorRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}
