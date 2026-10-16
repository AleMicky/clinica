using Clinica.Api.Modules.Almacenes.PartidaInventario.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.PartidaInventario.Validators;

public abstract class PartidaInventarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : PartidaInventarioRequest
{
    protected PartidaInventarioRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.NumeroPartida)
            .MaximumLength(50)
            .WithMessage("El número de partida no puede superar los 50 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.NumeroPartida));

        RuleFor(x => x.CostoUnitario)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo unitario no puede ser negativo.");
    }
}

public sealed class CreatePartidaInventarioRequestValidator
    : PartidaInventarioRequestValidator<CreatePartidaInventarioRequest>;

public sealed class UpdatePartidaInventarioRequestValidator
    : PartidaInventarioRequestValidator<UpdatePartidaInventarioRequest>;
