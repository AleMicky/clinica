using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Validators;

public abstract class MedicoServicioAcuerdoRequestValidator<T>
    : AbstractValidator<T>
    where T : MedicoServicioAcuerdoRequest
{
    protected MedicoServicioAcuerdoRequestValidator()
    {
        RuleFor(x => x.ServicioId)
            .GreaterThan(0)
            .WithMessage("El servicio es obligatorio.");

        RuleFor(x => x.ImporteServicio)
            .GreaterThan(0)
            .WithMessage("El importe del servicio debe ser mayor a cero.")
            .PrecisionScale(18, 2, false)
            .WithMessage(
                "El importe del servicio debe tener máximo 18 dígitos y 2 decimales.");

        RuleFor(x => x.ImporteMedico)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El importe del médico no puede ser negativo.")
            .PrecisionScale(18, 2, false)
            .WithMessage(
                "El importe del médico debe tener máximo 18 dígitos y 2 decimales.")
            .LessThanOrEqualTo(x => x.ImporteServicio)
            .WithMessage(
                "El importe del médico no puede ser mayor al importe del servicio.");

        RuleFor(x => x.FechaInicio)
            .NotEmpty()
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .When(x => x.FechaFin.HasValue)
            .WithMessage(
                "La fecha fin debe ser mayor o igual a la fecha de inicio.");
    }
}

public sealed class CreateMedicoServicioAcuerdoRequestValidator
    : MedicoServicioAcuerdoRequestValidator<CreateMedicoServicioAcuerdoRequest>
{
}

public sealed class UpdateMedicoServicioAcuerdoRequestValidator
    : MedicoServicioAcuerdoRequestValidator<UpdateMedicoServicioAcuerdoRequest>
{
}