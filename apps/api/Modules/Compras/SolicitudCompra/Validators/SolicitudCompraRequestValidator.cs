using Clinica.Api.Modules.Compras.SolicitudCompra.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Validators;

public abstract class SolicitudCompraRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : SolicitudCompraRequest
{
    protected SolicitudCompraRequestValidator()
    {
        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.FechaSolicitud)
            .NotEmpty()
            .WithMessage("La fecha de solicitud es obligatoria.");

        RuleFor(x => x.FechaRequerida)
            .GreaterThanOrEqualTo(x => x.FechaSolicitud)
            .WithMessage("La fecha requerida no puede ser anterior a la fecha de solicitud.")
            .When(x => x.FechaRequerida.HasValue);

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("La solicitud debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new SolicitudCompraDetalleRequestValidator());
    }
}

public sealed class SolicitudCompraDetalleRequestValidator
    : AbstractValidator<SolicitudCompraDetalleRequest>
{
    public SolicitudCompraDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.CantidadSolicitada)
            .GreaterThan(0)
            .WithMessage("La cantidad solicitada del detalle debe ser mayor que cero.");

        RuleFor(x => x.Observacion)
            .MaximumLength(250)
            .WithMessage("La observación del detalle no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateSolicitudCompraRequestValidator
    : SolicitudCompraRequestValidator<CreateSolicitudCompraRequest>;

public sealed class UpdateSolicitudCompraRequestValidator
    : SolicitudCompraRequestValidator<UpdateSolicitudCompraRequest>;

public sealed class AprobarSolicitudCompraRequestValidator
    : AbstractValidator<AprobarSolicitudCompraRequest>
{
    public AprobarSolicitudCompraRequestValidator()
    {
        RuleFor(x => x.ObservacionAprobacion)
            .MaximumLength(500)
            .WithMessage("La observación de aprobación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.ObservacionAprobacion));
    }
}

public sealed class RechazarSolicitudCompraRequestValidator
    : AbstractValidator<RechazarSolicitudCompraRequest>
{
    public RechazarSolicitudCompraRequestValidator()
    {
        RuleFor(x => x.MotivoRechazo)
            .NotEmpty()
            .WithMessage("El motivo de rechazo es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de rechazo no puede superar los 500 caracteres.");
    }
}

public sealed class CancelarSolicitudCompraRequestValidator
    : AbstractValidator<CancelarSolicitudCompraRequest>
{
    public CancelarSolicitudCompraRequestValidator()
    {
        RuleFor(x => x.MotivoCancelacion)
            .NotEmpty()
            .WithMessage("El motivo de cancelación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de cancelación no puede superar los 500 caracteres.");
    }
}
