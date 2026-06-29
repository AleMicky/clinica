using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.Recepcion;

public sealed class CrearRecepcionAtencionRequestValidator
    : AbstractValidator<CrearRecepcionAtencionRequest>
{
    public CrearRecepcionAtencionRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.TipoAtencionId).NotEmpty();
        RuleFor(x => x.RespuestasFormulario).NotNull();
    }
}
