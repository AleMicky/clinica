using Clinica.Modules.Caja.Domain.Entities;
using FluentValidation;

namespace Clinica.Modules.Caja.Application.Catalogos;

public sealed class CreateMetodoPagoRequestValidator : AbstractValidator<CreateMetodoPagoRequest>
{
    public CreateMetodoPagoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}

public sealed class UpdateMetodoPagoRequestValidator : AbstractValidator<UpdateMetodoPagoRequest>
{
    public UpdateMetodoPagoRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}

public sealed class CreateConceptoCajaRequestValidator : AbstractValidator<CreateConceptoCajaRequest>
{
    public CreateConceptoCajaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TipoMovimiento)
            .NotEmpty()
            .Must(t => t is TipoMovimientoCaja.Ingreso or TipoMovimientoCaja.Egreso)
            .WithMessage($"Tipo de movimiento debe ser {TipoMovimientoCaja.Ingreso} o {TipoMovimientoCaja.Egreso}.");
    }
}

public sealed class UpdateConceptoCajaRequestValidator : AbstractValidator<UpdateConceptoCajaRequest>
{
    public UpdateConceptoCajaRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TipoMovimiento)
            .NotEmpty()
            .Must(t => t is TipoMovimientoCaja.Ingreso or TipoMovimientoCaja.Egreso)
            .WithMessage($"Tipo de movimiento debe ser {TipoMovimientoCaja.Ingreso} o {TipoMovimientoCaja.Egreso}.");
    }
}
