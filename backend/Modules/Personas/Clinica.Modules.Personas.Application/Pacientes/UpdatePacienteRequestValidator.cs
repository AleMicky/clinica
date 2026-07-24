using Clinica.Modules.Personas.Application.Personas;
using FluentValidation;

namespace Clinica.Modules.Personas.Application.Pacientes;

public class UpdatePacienteRequestValidator : AbstractValidator<UpdatePacienteRequest>
{
    public UpdatePacienteRequestValidator(IValidator<UpdatePersonaRequest> personaValidator)
    {
        RuleFor(x => x.PersonaId).NotEmpty();
        RuleFor(x => x.NumeroHistoriaClinica).MaximumLength(30);

        RuleFor(x => x.Persona!)
            .SetValidator(personaValidator)
            .When(x => x.Persona is not null);
    }
}
