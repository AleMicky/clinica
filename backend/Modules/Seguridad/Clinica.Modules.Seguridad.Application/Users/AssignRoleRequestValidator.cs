using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Users;

public class AssignRoleRequestValidator : AbstractValidator<AssignRoleRequest>
{
    public AssignRoleRequestValidator()
    {
        RuleFor(x => x.Role).NotEmpty().MaximumLength(100);
    }
}