using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using FluentValidation;

namespace Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Validators;

public abstract class TipoMovimientoInventarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : TipoMovimientoInventarioRequest
{
    protected TipoMovimientoInventarioRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código es obligatorio.")
            .MaximumLength(10)
            .WithMessage("El código no puede superar los 10 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250)
            .WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));

        RuleFor(x => x.Naturaleza)
            .IsInEnum()
            .WithMessage("La naturaleza del movimiento es inválida.");
    }
}

public sealed class CreateTipoMovimientoInventarioRequestValidator
    : TipoMovimientoInventarioRequestValidator<CreateTipoMovimientoInventarioRequest>;

public sealed class UpdateTipoMovimientoInventarioRequestValidator
    : TipoMovimientoInventarioRequestValidator<UpdateTipoMovimientoInventarioRequest>;
