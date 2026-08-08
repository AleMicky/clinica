using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Validators;

public abstract class MedicoEspecialidadRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : MedicoEspecialidadRequest
{
    protected MedicoEspecialidadRequestValidator()
    {
        RuleFor(x => x.EspecialidadId)
            .GreaterThan(0)
            .WithMessage("La especialidad es obligatoria.");
    }
}

public sealed class CreateMedicoEspecialidadRequestValidator
    : MedicoEspecialidadRequestValidator<CreateMedicoEspecialidadRequest>;

public sealed class UpdateMedicoEspecialidadRequestValidator
    : MedicoEspecialidadRequestValidator<UpdateMedicoEspecialidadRequest>;
