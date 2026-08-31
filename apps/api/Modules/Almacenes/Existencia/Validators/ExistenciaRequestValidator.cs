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
    }
}

public sealed class CreateExistenciaRequestValidator
    : ExistenciaRequestValidator<CreateExistenciaRequest>;

public sealed class UpdateExistenciaRequestValidator
    : ExistenciaRequestValidator<UpdateExistenciaRequest>;
