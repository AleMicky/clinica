using FluentValidation;

namespace Clinica.Modules.Personas.Application.Empleados;

public class EmpleadoMedicoRequestValidator : AbstractValidator<EmpleadoMedicoRequest>
{
    public EmpleadoMedicoRequestValidator()
    {
        RuleFor(x => x.EspecialidadIds)
            .NotEmpty()
            .WithMessage("Seleccione al menos una especialidad.");
        RuleFor(x => x.EspecialidadPrincipalId).NotEmpty();
        RuleFor(x => x)
            .Must(x => x.EspecialidadIds.Contains(x.EspecialidadPrincipalId))
            .WithMessage("La especialidad principal debe estar entre las especialidades seleccionadas.");
        RuleFor(x => x.MatriculaProfesional).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RegistroColegioMedico).MaximumLength(50);
    }
}
