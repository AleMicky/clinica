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
    }
}

public sealed class CreateConvenioTarifarioRequestValidator
    : ConvenioTarifarioRequestValidator<CreateConvenioTarifarioRequest>;

public sealed class UpdateConvenioTarifarioRequestValidator
    : ConvenioTarifarioRequestValidator<UpdateConvenioTarifarioRequest>;
