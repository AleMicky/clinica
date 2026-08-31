using Clinica.Api.Modules.Almacenes.Lote.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.Lote.Validators;

public abstract class LoteRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : LoteRequest
{
    protected LoteRequestValidator()
    {
        RuleFor(x => x.ProductoId)
            .GreaterThan(0)
            .WithMessage("El producto es obligatorio.");

        RuleFor(x => x.NumeroLote)
            .NotEmpty()
            .WithMessage("El número de lote es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El número de lote no puede superar los 50 caracteres.");

        RuleFor(x => x.FechaVencimiento)
            .GreaterThanOrEqualTo(x => x.FechaFabricacion)
            .WithMessage("La fecha de vencimiento no puede ser anterior a la fecha de fabricación.")
            .When(x => x.FechaFabricacion.HasValue && x.FechaVencimiento.HasValue);

        RuleFor(x => x.CostoUnitario)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo unitario no puede ser negativo.")
            .When(x => x.CostoUnitario.HasValue);
    }
}

public sealed class CreateLoteRequestValidator
    : LoteRequestValidator<CreateLoteRequest>;

public sealed class UpdateLoteRequestValidator
    : LoteRequestValidator<UpdateLoteRequest>;
