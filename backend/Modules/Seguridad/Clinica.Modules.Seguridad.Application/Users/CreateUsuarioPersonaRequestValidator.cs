using Clinica.Modules.Personas.Application.Personas;
using FluentValidation;

namespace Clinica.Modules.Seguridad.Application.Users;

public class CreateUsuarioPersonaRequestValidator : AbstractValidator<CreateUsuarioPersonaRequest>
{
    public CreateUsuarioPersonaRequestValidator(IValidator<CreatePersonaRequest> personaValidator)
    {
        RuleFor(x => x.Modo)
            .NotEmpty()
            .Must(m => m is "nueva" or "existente")
            .WithMessage("El modo debe ser 'nueva' o 'existente'.");

        RuleFor(x => x.PersonaId)
            .NotEmpty()
            .When(x => x.Modo == "existente")
            .WithMessage("Debe seleccionar una persona existente.");

        RuleFor(x => x.Persona)
            .NotNull()
            .When(x => x.Modo == "nueva")
            .WithMessage("Debe completar los datos de la nueva persona.");

        RuleFor(x => x.Persona!)
            .SetValidator(personaValidator)
            .When(x => x.Modo == "nueva" && x.Persona is not null);

        RuleFor(x => x.UserName)
            .MaximumLength(100)
            .Matches(@"^[a-zA-Z0-9._-]*$")
            .When(x => !string.IsNullOrWhiteSpace(x.UserName))
            .WithMessage("El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8);

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Roles)
            .NotEmpty()
            .WithMessage("Debe asignar al menos un rol.");
    }
}
