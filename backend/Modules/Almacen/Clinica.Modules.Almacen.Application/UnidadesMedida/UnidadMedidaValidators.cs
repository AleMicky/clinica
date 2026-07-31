using FluentValidation;

namespace Clinica.Modules.Almacen.Application.UnidadesMedida;

public sealed class CreateUnidadMedidaRequestValidator : AbstractValidator<CreateUnidadMedidaRequest>
{
    public CreateUnidadMedidaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}

public sealed class UpdateUnidadMedidaRequestValidator : AbstractValidator<UpdateUnidadMedidaRequest>
{
    public UpdateUnidadMedidaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}
