using Clinica.Api.Modules.Almacenes.Existencia.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.Existencia.Validators;

public abstract class ExistenciaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ExistenciaRequest
{
    protected ExistenciaRequestValidator()
    {
        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad no puede ser negativa.");

        RuleFor(x => x.CantidadReservada)
            .GreaterThanOrEqualTo(0)
            .WithMessage("La cantidad reservada no puede ser negativa.");

        RuleFor(x => x.CantidadReservada)
            .LessThanOrEqualTo(x => x.Cantidad)
            .WithMessage("La cantidad reservada no puede ser mayor que la cantidad.");

        RuleFor(x => x.CostoPromedio)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo promedio no puede ser negativo.");
    }
}

public sealed class CreateExistenciaRequestValidator
    : ExistenciaRequestValidator<CreateExistenciaRequest>;

public sealed class UpdateExistenciaRequestValidator
    : ExistenciaRequestValidator<UpdateExistenciaRequest>;

public sealed class MovimientoStockExistenciaRequestValidator
    : AbstractValidator<MovimientoStockExistenciaRequest>
{
    public MovimientoStockExistenciaRequestValidator()
    {
        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad debe ser mayor que cero.");

        RuleFor(x => x.CostoUnitario)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CostoUnitario.HasValue)
            .WithMessage("El costo unitario no puede ser negativo.");
    }
}

public sealed class ReservaStockExistenciaRequestValidator
    : AbstractValidator<ReservaStockExistenciaRequest>
{
    public ReservaStockExistenciaRequestValidator()
    {
        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad debe ser mayor que cero.");
    }
}

public sealed class ActualizarCostoPromedioRequestValidator
    : AbstractValidator<ActualizarCostoPromedioRequest>
{
    public ActualizarCostoPromedioRequestValidator()
    {
        RuleFor(x => x.AlmacenId)
            .GreaterThan(0)
            .WithMessage("El almacén es obligatorio.");

        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.CostoPromedio)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo promedio no puede ser negativo.");
    }
}

