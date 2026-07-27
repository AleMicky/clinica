using FluentValidation;

namespace Clinica.Modules.Compras.Application.Proveedores;

public sealed class CreateProveedorRequestValidator : AbstractValidator<CreateProveedorRequest>
{
    public CreateProveedorRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}

public sealed class UpdateProveedorRequestValidator : AbstractValidator<UpdateProveedorRequest>
{
    public UpdateProveedorRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
