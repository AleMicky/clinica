using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Validators;

public sealed class CreateRolOpcionMenuRequestValidator
    : AbstractValidator<CreateRolOpcionMenuRequest>
{
    public CreateRolOpcionMenuRequestValidator()
    {
        RuleFor(x => x.OpcionMenuId)
            .GreaterThan(0)
            .WithMessage(
                "El identificador de la opción de menú debe ser mayor a 0.");
    }
}

public sealed class AsignarRolOpcionMenuRequestValidator
    : AbstractValidator<AsignarRolOpcionMenuRequest>
{
    public AsignarRolOpcionMenuRequestValidator()
    {
        RuleFor(x => x.OpcionMenuIds)
            .NotNull()
            .WithMessage(
                "Debe especificar las opciones de menú.");

        RuleForEach(x => x.OpcionMenuIds)
            .GreaterThan(0)
            .WithMessage(
                "El identificador de la opción de menú debe ser mayor a 0.");
    }
}