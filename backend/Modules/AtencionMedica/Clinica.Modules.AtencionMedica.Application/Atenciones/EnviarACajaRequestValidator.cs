using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Atenciones;

public sealed class EnviarACajaRequestValidator : AbstractValidator<EnviarACajaRequest>
{
    public EnviarACajaRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
    }
}
