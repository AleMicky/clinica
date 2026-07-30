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
