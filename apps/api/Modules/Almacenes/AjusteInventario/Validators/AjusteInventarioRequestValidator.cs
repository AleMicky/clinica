using Clinica.Api.Modules.Almacenes.AjusteInventario.Dtos;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Enums;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Validators;

public abstract class AjusteInventarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : AjusteInventarioRequest
{
    protected AjusteInventarioRequestValidator()
    {

        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.Tipo)
            .IsInEnum()
            .WithMessage("El tipo de ajuste es obligatorio.");

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
            .WithMessage("El ajuste debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new AjusteInventarioDetalleRequestValidator());
    }
}

public sealed class AjusteInventarioDetalleRequestValidator
    : AbstractValidator<AjusteInventarioDetalleRequest>
{
    public AjusteInventarioDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad del detalle debe ser mayor que cero.");
    }
}

public sealed class CreateAjusteInventarioRequestValidator
    : AjusteInventarioRequestValidator<CreateAjusteInventarioRequest>;

public sealed class UpdateAjusteInventarioRequestValidator
    : AjusteInventarioRequestValidator<UpdateAjusteInventarioRequest>;

public sealed class AnularAjusteInventarioRequestValidator
    : AbstractValidator<AnularAjusteInventarioRequest>
{
    public AnularAjusteInventarioRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}
