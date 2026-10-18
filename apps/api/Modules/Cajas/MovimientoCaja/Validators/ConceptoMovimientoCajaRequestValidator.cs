using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Validators;

public sealed class CreateConceptoMovimientoCajaRequestValidator
    : AbstractValidator<CreateConceptoMovimientoCajaRequest>
{
    public CreateConceptoMovimientoCajaRequestValidator()
    {
        RuleFor(x => x.TipoMovimientoCajaId)
            .GreaterThan(0).WithMessage("El tipo de movimiento es obligatorio.");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("El código es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede superar los 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250).WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));
    }
}

public sealed class UpdateConceptoMovimientoCajaRequestValidator
    : AbstractValidator<UpdateConceptoMovimientoCajaRequest>
{
    public UpdateConceptoMovimientoCajaRequestValidator()
    {
        RuleFor(x => x.TipoMovimientoCajaId)
            .GreaterThan(0).WithMessage("El tipo de movimiento es obligatorio.");

        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("El código es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede superar los 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250).WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));
    }
}
