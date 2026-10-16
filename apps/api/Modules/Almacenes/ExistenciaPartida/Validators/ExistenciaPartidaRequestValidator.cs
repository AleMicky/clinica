using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.ExistenciaPartida.Validators;

public abstract class ExistenciaPartidaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ExistenciaPartidaRequest
{
    protected ExistenciaPartidaRequestValidator()
    {
        RuleFor(x => x.ExistenciaId)
            .GreaterThan(0)
            .WithMessage("La existencia es obligatoria.");

        RuleFor(x => x.PartidaInventarioId)
            .GreaterThan(0)
            .WithMessage("La partida de inventario es obligatoria.");

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

public sealed class CreateExistenciaPartidaRequestValidator
    : ExistenciaPartidaRequestValidator<CreateExistenciaPartidaRequest>;

public sealed class UpdateExistenciaPartidaRequestValidator
    : ExistenciaPartidaRequestValidator<UpdateExistenciaPartidaRequest>;
