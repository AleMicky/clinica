using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;

public static class ProgramacionDiariaEstados
{
    public const string Activo = "ACTIVO";
    public const string Inactivo = "INACTIVO";
    public const string Cancelado = "CANCELADO";

    public static readonly HashSet<string> Validos =
    [
        Activo,
        Inactivo,
        Cancelado
    ];
}

public class CreateProgramacionDiariaRequestValidator : AbstractValidator<CreateProgramacionDiariaRequest>
{
    public CreateProgramacionDiariaRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.TurnoId).NotEmpty();
        RuleFor(x => x.AreaId).NotEmpty();
        RuleFor(x => x.CargoId).NotEmpty();
        RuleFor(x => x.MaxPacientes).GreaterThan(0).LessThanOrEqualTo(999);
        RuleFor(x => x.Estado)
            .NotEmpty()
            .Must(x => ProgramacionDiariaEstados.Validos.Contains(x))
            .WithMessage("Estado inválido.");
        RuleFor(x => x.Observacion).MaximumLength(1000);
    }
}

public class UpdateProgramacionDiariaRequestValidator : AbstractValidator<UpdateProgramacionDiariaRequest>
{
    public UpdateProgramacionDiariaRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.TurnoId).NotEmpty();
        RuleFor(x => x.AreaId).NotEmpty();
        RuleFor(x => x.CargoId).NotEmpty();
        RuleFor(x => x.MaxPacientes).GreaterThan(0).LessThanOrEqualTo(999);
        RuleFor(x => x.Estado)
            .NotEmpty()
            .Must(x => ProgramacionDiariaEstados.Validos.Contains(x))
            .WithMessage("Estado inválido.");
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
