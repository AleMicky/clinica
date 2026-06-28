using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;

public class UpdateAtencionFormularioRespuestaRequestValidator
    : AbstractValidator<UpdateAtencionFormularioRespuestaRequest>
{
    public UpdateAtencionFormularioRespuestaRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.FormularioCampoId).NotEmpty();
        RuleFor(x => x.ValorTexto).MaximumLength(4000);
    }
}
