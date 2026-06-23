using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Roles;

public class UpdateRoleRequestValidator : AbstractValidator<UpdateRoleRequest>
{
    public UpdateRoleRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del rol es obligatorio.")
            .MaximumLength(100);

        RuleFor(x => x.Descripcion)
            .MaximumLength(500);
    }
}
