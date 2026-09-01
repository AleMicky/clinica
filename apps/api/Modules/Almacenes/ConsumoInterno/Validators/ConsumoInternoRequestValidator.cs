using Clinica.Api.Modules.Almacenes.ConsumoInterno.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Validators;

public abstract class ConsumoInternoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ConsumoInternoRequest
{
    protected ConsumoInternoRequestValidator()
    {
        RuleFor(x => x.Numero)
            .NotEmpty()
            .WithMessage("El número es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El número no puede superar los 20 caracteres.");

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.AreaId)
            .GreaterThan(0)
            .WithMessage("El área es obligatoria.");

        RuleFor(x => x.Fecha)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.");

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
            .WithMessage("El consumo interno debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new ConsumoInternoDetalleRequestValidator());
    }
}

public sealed class ConsumoInternoDetalleRequestValidator
    : AbstractValidator<ConsumoInternoDetalleRequest>
{
    public ConsumoInternoDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad del detalle debe ser mayor que cero.");
    }
}

public sealed class CreateConsumoInternoRequestValidator
    : ConsumoInternoRequestValidator<CreateConsumoInternoRequest>;

public sealed class UpdateConsumoInternoRequestValidator
    : ConsumoInternoRequestValidator<UpdateConsumoInternoRequest>;

public sealed class AnularConsumoInternoRequestValidator
    : AbstractValidator<AnularConsumoInternoRequest>
{
    public AnularConsumoInternoRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}