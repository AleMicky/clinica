using FluentValidation;

namespace Clinica.Modules.AtencionMedica.Application.AtencionFormularioRespuestas;

public class CreateAtencionFormularioRespuestaRequestValidator
    : AbstractValidator<CreateAtencionFormularioRespuestaRequest>
{
    public CreateAtencionFormularioRespuestaRequestValidator()
    {
        RuleFor(x => x.AtencionId).NotEmpty();
        RuleFor(x => x.FormularioCampoId).NotEmpty();
        RuleFor(x => x.ValorTexto).MaximumLength(4000);
    }
}
