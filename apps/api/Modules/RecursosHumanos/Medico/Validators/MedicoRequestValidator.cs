using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Validators;

public abstract class MedicoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : MedicoRequest
{
    protected MedicoRequestValidator()
    {
        RuleFor(x => x.MatriculaProfesional)
            .NotEmpty()
            .WithMessage("La matrícula profesional es obligatoria.")
            .MaximumLength(30)
            .WithMessage("La matrícula profesional no puede superar los 30 caracteres.");

        RuleFor(x => x.RegistroMinisterioSalud)
            .MaximumLength(30)
            .WithMessage("El registro del Ministerio de Salud no puede superar los 30 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.RegistroMinisterioSalud));

        RuleFor(x => x.Especialidades)
            .Must(list => list == null || list.Count(e => e.EsPrincipal) <= 1)
            .WithMessage("Solo se puede marcar una especialidad como principal.")
            .Must(list => list == null || list.All(e => e.EspecialidadId > 0))
            .WithMessage("Cada especialidad debe tener un identificador válido.");
    }
}

public sealed class CreateMedicoRequestValidator
    : MedicoRequestValidator<CreateMedicoRequest>;

public sealed class UpdateMedicoRequestValidator
    : MedicoRequestValidator<UpdateMedicoRequest>;
