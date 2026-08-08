using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Servicios.Convenios.Validators;

public abstract class ConvenioTarifarioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : ConvenioTarifarioRequest
{
    protected ConvenioTarifarioRequestValidator()
    {
        RuleFor(x => x.TarifarioId)
            .GreaterThan(0)
            .WithMessage("El tarifario es obligatorio.");

        RuleFor(x => x.FechaInicio)
            .NotEmpty()
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .WithMessage("La fecha de fin debe ser mayor o igual a la fecha de inicio.")
            .When(x => x.FechaFin.HasValue);
    }
}

public sealed class CreateConvenioTarifarioRequestValidator
    : ConvenioTarifarioRequestValidator<CreateConvenioTarifarioRequest>;

public sealed class UpdateConvenioTarifarioRequestValidator
    : ConvenioTarifarioRequestValidator<UpdateConvenioTarifarioRequest>;
