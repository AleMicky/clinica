using FluentValidation;

namespace Clinica.Modules.Personas.Application.Medicos;

public class CreateMedicoRequestValidator : AbstractValidator<CreateMedicoRequest>
{
    public CreateMedicoRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.EspecialidadId).NotEmpty();
        RuleFor(x => x.MatriculaProfesional).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RegistroColegioMedico).MaximumLength(50);
    }
}
