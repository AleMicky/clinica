using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public class SetSolicitudEstadoRequestValidator : AbstractValidator<SetSolicitudEstadoRequest>
{
    public SetSolicitudEstadoRequestValidator()
    {
        RuleFor(x => x.Estado).NotEmpty().MaximumLength(50);
    }
}
