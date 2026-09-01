using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Validators;

public abstract class TransferenciaAlmacenRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : TransferenciaAlmacenRequest
{
    protected TransferenciaAlmacenRequestValidator()
    {
        RuleFor(x => x.Numero)
            .NotEmpty()
            .WithMessage("El número es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El número no puede superar los 20 caracteres.");

        RuleFor(x => x.AlmacenOrigenId)
            .GreaterThan(0)
            .WithMessage("El almacén de origen es obligatorio.");

        RuleFor(x => x.AlmacenDestinoId)
            .GreaterThan(0)
            .WithMessage("El almacén de destino es obligatorio.");

        RuleFor(x => x.FechaSolicitud)
            .NotEmpty()
            .WithMessage("La fecha de solicitud es obligatoria.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La transferencia debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new TransferenciaAlmacenDetalleRequestValidator());
    }
}

public sealed class TransferenciaAlmacenDetalleRequestValidator
    : AbstractValidator<TransferenciaAlmacenDetalleRequest>
{
    public TransferenciaAlmacenDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.CantidadSolicitada)
            .GreaterThan(0)
            .WithMessage("La cantidad solicitada del detalle debe ser mayor que cero.");
    }
}

public sealed class CreateTransferenciaAlmacenRequestValidator
    : TransferenciaAlmacenRequestValidator<CreateTransferenciaAlmacenRequest>;

public sealed class UpdateTransferenciaAlmacenRequestValidator
    : TransferenciaAlmacenRequestValidator<UpdateTransferenciaAlmacenRequest>;

public sealed class AprobarTransferenciaAlmacenRequestValidator
    : AbstractValidator<AprobarTransferenciaAlmacenRequest>
{
    public AprobarTransferenciaAlmacenRequestValidator()
    {
        RuleForEach(x => x.Cantidades)
            .SetValidator(new TransferenciaDetalleCantidadRequestValidator());
    }
}

public sealed class DespacharTransferenciaAlmacenRequestValidator
    : AbstractValidator<DespacharTransferenciaAlmacenRequest>
{
    public DespacharTransferenciaAlmacenRequestValidator()
    {
        RuleForEach(x => x.Cantidades)
            .SetValidator(new TransferenciaDetalleCantidadRequestValidator());
    }
}

public sealed class RecibirTransferenciaAlmacenRequestValidator
    : AbstractValidator<RecibirTransferenciaAlmacenRequest>
{
    public RecibirTransferenciaAlmacenRequestValidator()
    {
        RuleForEach(x => x.Cantidades)
            .SetValidator(new TransferenciaDetalleCantidadRequestValidator());
    }
}

public sealed class TransferenciaDetalleCantidadRequestValidator
    : AbstractValidator<TransferenciaDetalleCantidadRequest>
{
    public TransferenciaDetalleCantidadRequestValidator()
    {
        RuleFor(x => x.DetalleId)
            .GreaterThan(0)
            .WithMessage("El detalle es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad no puede ser negativa.");
    }
}

public sealed class CancelarTransferenciaAlmacenRequestValidator
    : AbstractValidator<CancelarTransferenciaAlmacenRequest>
{
    public CancelarTransferenciaAlmacenRequestValidator()
    {
        RuleFor(x => x.MotivoCancelacion)
            .NotEmpty()
            .WithMessage("El motivo de cancelación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de cancelación no puede superar los 500 caracteres.");
    }
}
