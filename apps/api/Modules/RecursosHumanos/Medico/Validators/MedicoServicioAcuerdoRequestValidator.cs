using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Validators;

public abstract class MedicoServicioAcuerdoRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : MedicoServicioAcuerdoRequest
{
    protected MedicoServicioAcuerdoRequestValidator()
    {
        RuleFor(x => x.ServicioId)
            .GreaterThan(0)
            .WithMessage("El servicio es obligatorio.");

        RuleFor(x => x.PorcentajeMedico)
            .InclusiveBetween(0, 100)
            .WithMessage("El porcentaje del médico debe estar entre 0 y 100.");

        RuleFor(x => x.FechaInicio)
            .NotEqual(default(DateOnly))
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .WithMessage("La fecha fin no puede ser anterior a la fecha de inicio.")
            .When(x => x.FechaFin is not null);
    }
}

public sealed class CreateMedicoServicioAcuerdoRequestValidator
    : MedicoServicioAcuerdoRequestValidator<CreateMedicoServicioAcuerdoRequest>;

public sealed class UpdateMedicoServicioAcuerdoRequestValidator
    : MedicoServicioAcuerdoRequestValidator<UpdateMedicoServicioAcuerdoRequest>;
