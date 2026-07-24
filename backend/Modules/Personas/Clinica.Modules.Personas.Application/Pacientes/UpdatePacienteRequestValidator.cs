using FluentValidation;

namespace Clinica.Modules.Personas.Application.Pacientes;

public class UpdatePacienteRequestValidator : AbstractValidator<UpdatePacienteRequest>
{
    public UpdatePacienteRequestValidator()
    {
        RuleFor(x => x.PersonaId).NotEmpty();
        RuleFor(x => x.NumeroHistoriaClinica).NotEmpty().MaximumLength(30);
    }
}
