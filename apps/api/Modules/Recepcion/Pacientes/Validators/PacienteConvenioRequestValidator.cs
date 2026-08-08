using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Validators;

public abstract class PacienteConvenioRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : PacienteConvenioRequest
{
    protected PacienteConvenioRequestValidator()
    {
        RuleFor(x => x.ConvenioId)
            .GreaterThan(0)
            .WithMessage("El convenio es obligatorio.");

        RuleFor(x => x.NumeroAfiliado)
            .MaximumLength(50)
            .WithMessage("El número de afiliado no puede superar los 50 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.NumeroAfiliado));

        RuleFor(x => x.FechaInicio)
            .NotEqual(default(DateOnly))
            .WithMessage("La fecha de inicio es obligatoria.");

        RuleFor(x => x.FechaFin)
            .GreaterThanOrEqualTo(x => x.FechaInicio)
            .WithMessage("La fecha fin no puede ser anterior a la fecha de inicio.")
            .When(x => x.FechaFin is not null);
    }
}

public sealed class CreatePacienteConvenioRequestValidator
    : PacienteConvenioRequestValidator<CreatePacienteConvenioRequest>;

public sealed class UpdatePacienteConvenioRequestValidator
    : PacienteConvenioRequestValidator<UpdatePacienteConvenioRequest>;
