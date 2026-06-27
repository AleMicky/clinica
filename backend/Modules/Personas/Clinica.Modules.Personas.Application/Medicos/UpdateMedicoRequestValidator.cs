using FluentValidation;

namespace Clinica.Modules.Personas.Application.Medicos;

public class UpdateMedicoRequestValidator : AbstractValidator<UpdateMedicoRequest>
{
    public UpdateMedicoRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.EspecialidadId).NotEmpty();
        RuleFor(x => x.MatriculaProfesional).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RegistroColegioMedico).MaximumLength(50);
    }
}
