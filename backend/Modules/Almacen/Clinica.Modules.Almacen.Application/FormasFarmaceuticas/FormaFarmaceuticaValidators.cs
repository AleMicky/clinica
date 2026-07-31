using FluentValidation;

namespace Clinica.Modules.Almacen.Application.FormasFarmaceuticas;

public sealed class CreateFormaFarmaceuticaRequestValidator : AbstractValidator<CreateFormaFarmaceuticaRequest>
{
    public CreateFormaFarmaceuticaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}

public sealed class UpdateFormaFarmaceuticaRequestValidator : AbstractValidator<UpdateFormaFarmaceuticaRequest>
{
    public UpdateFormaFarmaceuticaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
    }
}
