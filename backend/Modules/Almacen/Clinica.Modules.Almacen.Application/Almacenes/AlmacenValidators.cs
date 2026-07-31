using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Almacenes;

public sealed class CreateAlmacenRequestValidator : AbstractValidator<CreateAlmacenRequest>
{
    public CreateAlmacenRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TipoAlmacenId).NotEmpty();
    }
}

public sealed class UpdateAlmacenRequestValidator : AbstractValidator<UpdateAlmacenRequest>
{
    public UpdateAlmacenRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TipoAlmacenId).NotEmpty();
    }
}
