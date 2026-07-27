using FluentValidation;

namespace Clinica.Modules.Caja.Application.Cajas;

public sealed class CreateCajaRequestValidator : AbstractValidator<CreateCajaRequest>
{
    public CreateCajaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}

public sealed class UpdateCajaRequestValidator : AbstractValidator<UpdateCajaRequest>
{
    public UpdateCajaRequestValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
