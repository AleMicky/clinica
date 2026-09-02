using Clinica.Api.Modules.Almacenes.BajaInventario.Dtos;
using Clinica.Api.Modules.Almacenes.BajaInventario.Enums;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Validators;

public abstract class BajaInventarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : BajaInventarioRequest
{
    protected BajaInventarioRequestValidator()
    {


        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.Tipo)
            .IsInEnum()
            .WithMessage("El tipo de baja es obligatorio.");

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
            .WithMessage("La baja debe tener al menos un detalle.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new BajaInventarioDetalleRequestValidator());
    }
}

public sealed class BajaInventarioDetalleRequestValidator
    : AbstractValidator<BajaInventarioDetalleRequest>
{
    public BajaInventarioDetalleRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto del detalle es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad del detalle debe ser mayor que cero.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación del detalle no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));
    }
}

public sealed class CreateBajaInventarioRequestValidator
    : BajaInventarioRequestValidator<CreateBajaInventarioRequest>;

public sealed class UpdateBajaInventarioRequestValidator
    : BajaInventarioRequestValidator<UpdateBajaInventarioRequest>;

public sealed class AnularBajaInventarioRequestValidator
    : AbstractValidator<AnularBajaInventarioRequest>
{
    public AnularBajaInventarioRequestValidator()
    {
        RuleFor(x => x.MotivoAnulacion)
            .NotEmpty()
            .WithMessage("El motivo de anulación es obligatorio.")
            .MaximumLength(500)
            .WithMessage("El motivo de anulación no puede superar los 500 caracteres.");
    }
}