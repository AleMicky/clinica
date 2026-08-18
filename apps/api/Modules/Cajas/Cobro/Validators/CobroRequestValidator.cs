using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.Cobro.Validators;

public abstract class CobroRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : CobroRequest
{
    protected CobroRequestValidator()
    {
        RuleFor(x => x.TurnoCajaId)
            .GreaterThan(0)
            .WithMessage("El turno de caja es obligatorio.");

        RuleFor(x => x.VentaPagadorId)
            .GreaterThan(0)
            .WithMessage("El pagador de la venta es obligatorio.");

        RuleFor(x => x.FechaHora)
            .NotEqual(default(DateTime))
            .WithMessage("La fecha y hora del cobro son obligatorias.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("El cobro debe tener al menos un detalle de pago.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new CobroDetalleRequestValidator());
    }
}

public sealed class CreateCobroRequestValidator
    : CobroRequestValidator<CreateCobroRequest>;

public sealed class UpdateCobroRequestValidator
    : CobroRequestValidator<UpdateCobroRequest>;

public sealed class AnularCobroRequestValidator
    : AbstractValidator<AnularCobroRequest>
{
    public AnularCobroRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}