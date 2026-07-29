using Clinica.Modules.RecursosHumanos.Domain.Enums;
using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;

public class CreateProgramacionDiariaRequestValidator : AbstractValidator<CreateProgramacionDiariaRequest>
{
    public CreateProgramacionDiariaRequestValidator()
    {
        RuleFor(x => x.ProgramacionId).NotEmpty();
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.Fecha).NotEmpty();
        RuleFor(x => x.TipoAsignacion).IsInEnum();
        RuleFor(x => x.TurnoId)
            .NotEmpty()
            .When(x => x.TipoAsignacion == TipoAsignacionProgramacion.Regular)
            .WithMessage("El turno es obligatorio para asignaciones regulares.");
        RuleFor(x => x.Observacion).MaximumLength(1000);
    }
}

public class UpdateProgramacionDiariaRequestValidator : AbstractValidator<UpdateProgramacionDiariaRequest>
{
    public UpdateProgramacionDiariaRequestValidator()
    {
        RuleFor(x => x.ProgramacionId).NotEmpty();
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.Fecha).NotEmpty();
        RuleFor(x => x.TipoAsignacion).IsInEnum();
        RuleFor(x => x.TurnoId)
            .NotEmpty()
            .When(x => x.TipoAsignacion == TipoAsignacionProgramacion.Regular)
            .WithMessage("El turno es obligatorio para asignaciones regulares.");
        RuleFor(x => x.Observacion).MaximumLength(1000);
    }
}

public class ValidarMedicoProgramadoRequestValidator : AbstractValidator<ValidarMedicoProgramadoRequest>
{
    public ValidarMedicoProgramadoRequestValidator()
    {
        RuleFor(x => x.MedicoId).NotEmpty();
        RuleFor(x => x.FechaAtencion).NotEmpty();
    }
}
