using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public class EnviarACajaRequestValidator : AbstractValidator<EnviarACajaRequest>
{
    public EnviarACajaRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
    }
}
