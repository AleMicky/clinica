using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.Cobro.Validators;

public sealed class CobroDetalleRequestValidator
    : AbstractValidator<CobroDetalleRequest>
{
    public CobroDetalleRequestValidator()
    {
        RuleFor(x => x.MetodoPagoId)
            .GreaterThan(0)
            .WithMessage("El método de pago es obligatorio.");

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.CuentaBancariaId)
            .GreaterThan(0)
            .WithMessage("La cuenta bancaria no es válida.")
            .When(x => x.CuentaBancariaId.HasValue);

        RuleFor(x => x.Monto)
            .GreaterThan(0)
            .WithMessage("El monto del detalle debe ser mayor que cero.");

        RuleFor(x => x.TipoCambio)
            .GreaterThan(0)
            .WithMessage("El tipo de cambio debe ser mayor que cero.");

        RuleFor(x => x.Referencia)
            .MaximumLength(100)
            .WithMessage("La referencia no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Referencia));

        RuleFor(x => x.EntidadFinanciera)
            .MaximumLength(100)
            .WithMessage("La entidad financiera no puede superar los 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.EntidadFinanciera));

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación del detalle no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

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