using FluentValidation;

namespace Clinica.Modules.Personas.Application.Pacientes;

public class UpdatePacienteRequestValidator : AbstractValidator<UpdatePacienteRequest>
{
    public UpdatePacienteRequestValidator()
    {
        RuleFor(x => x.PersonaId).NotEmpty();
        RuleFor(x => x.NumeroHistoriaClinica).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Alergias).MaximumLength(500);
        RuleFor(x => x.Observaciones).MaximumLength(1000);
    }
}
