using Clinica.Modules.Personas.Application.Personas;
using FluentValidation;

namespace Clinica.Modules.Personas.Application.Pacientes;

public class CreatePacienteRequestValidator : AbstractValidator<CreatePacienteRequest>
{
    public CreatePacienteRequestValidator(IValidator<CreatePersonaRequest> personaValidator)
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

        RuleFor(x => x.NumeroHistoriaClinica)
            .MaximumLength(30)
            .When(x => !string.IsNullOrWhiteSpace(x.NumeroHistoriaClinica));

        RuleFor(x => x.Alergias).MaximumLength(500);
        RuleFor(x => x.Observaciones).MaximumLength(1000);
    }
}
