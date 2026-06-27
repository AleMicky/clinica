using FluentValidation;

namespace Clinica.Modules.Personas.Application.ContactosEmergencia;

public class CreateContactoEmergenciaRequestValidator : AbstractValidator<CreateContactoEmergenciaRequest>
{
    public CreateContactoEmergenciaRequestValidator()
    {
        RuleFor(x => x.PersonaId).NotEmpty();
        RuleFor(x => x.Nombres).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Apellidos).MaximumLength(100);
        RuleFor(x => x.Telefono).MaximumLength(20);
        RuleFor(x => x.Celular).MaximumLength(20);
        RuleFor(x => x.Direccion).MaximumLength(500);
    }
}
