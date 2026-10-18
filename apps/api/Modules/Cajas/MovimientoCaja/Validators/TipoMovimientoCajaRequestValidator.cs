using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Validators;

public sealed class CreateTipoMovimientoCajaRequestValidator
    : AbstractValidator<CreateTipoMovimientoCajaRequest>
{
    public CreateTipoMovimientoCajaRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("El código es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede superar los 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Naturaleza)
            .NotEmpty().WithMessage("La naturaleza es obligatoria.")
            .Must(n => n.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase) ||
                       n.Equals("SALIDA", StringComparison.OrdinalIgnoreCase))
            .WithMessage("La naturaleza debe ser 'ENTRADA' o 'SALIDA'.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250).WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));
    }
}

public sealed class UpdateTipoMovimientoCajaRequestValidator
    : AbstractValidator<UpdateTipoMovimientoCajaRequest>
{
    public UpdateTipoMovimientoCajaRequestValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("El código es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede superar los 50 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.Naturaleza)
            .NotEmpty().WithMessage("La naturaleza es obligatoria.")
            .Must(n => n.Equals("ENTRADA", StringComparison.OrdinalIgnoreCase) ||
                       n.Equals("SALIDA", StringComparison.OrdinalIgnoreCase))
            .WithMessage("La naturaleza debe ser 'ENTRADA' o 'SALIDA'.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(250).WithMessage("La descripción no puede superar los 250 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Descripcion));
    }
}
