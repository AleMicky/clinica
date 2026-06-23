using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Roles;

public class CreateRoleRequestValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}