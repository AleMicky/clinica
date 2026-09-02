using Clinica.Api.Modules.Almacenes.InventarioFisico.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Validators;

public abstract class InventarioFisicoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : InventarioFisicoRequest
{
    protected InventarioFisicoRequestValidator()
    {
        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.FechaInicio)
            .NotEmpty()
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("El inventario físico debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new InventarioFisicoDetalleRequestValidator());
    }
}

public sealed class InventarioFisicoDetalleRequestValidator
    : AbstractValidator<InventarioFisicoDetalleRequest>
{
    public InventarioFisicoDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.CantidadSistema)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad del sistema no puede ser negativa.");

        RuleFor(x => x.CantidadContada)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad contada no puede ser negativa.")
            .When(x => x.CantidadContada.HasValue);
    }
}

public sealed class CreateInventarioFisicoRequestValidator
    : InventarioFisicoRequestValidator<CreateInventarioFisicoRequest>;

public sealed class UpdateInventarioFisicoRequestValidator
    : InventarioFisicoRequestValidator<UpdateInventarioFisicoRequest>;

public sealed class InventarioFisicoConteoDetalleRequestValidator
    : AbstractValidator<InventarioFisicoConteoDetalleRequest>
{
    public InventarioFisicoConteoDetalleRequestValidator()
    {
        RuleFor(x => x.DetalleId)
            .GreaterThan(0)
            .WithMessage("El detalle es obligatorio.");

        RuleFor(x => x.CantidadContada)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad contada no puede ser negativa.");
    }
}

public sealed class RegistrarConteoInventarioFisicoRequestValidator
    : AbstractValidator<RegistrarConteoInventarioFisicoRequest>
{
    public RegistrarConteoInventarioFisicoRequestValidator()
    {
        RuleFor(x => x.Conteo)
            .NotEmpty()
            .WithMessage("Debe registrar el conteo de al menos un detalle.");

        RuleForEach(x => x.Conteo)
            .SetValidator(new InventarioFisicoConteoDetalleRequestValidator());
    }
}

public sealed class AnularInventarioFisicoRequestValidator
    : AbstractValidator<AnularInventarioFisicoRequest>
{
    public AnularInventarioFisicoRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}