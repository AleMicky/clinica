using FluentValidation;

namespace Clinica.Modules.Personas.Application.Personas;

public class CreatePersonaRequestValidator : AbstractValidator<CreatePersonaRequest>
{
    public CreatePersonaRequestValidator()
    {
        RuleFor(x => x.TipoDocumentoId).NotEmpty();
        RuleFor(x => x.NumeroDocumento).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Nombres).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ApellidoPaterno).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ApellidoMaterno).MaximumLength(100);
        RuleFor(x => x.ComplementoDocumento).MaximumLength(10);
        RuleFor(x => x.SexoId).NotEmpty();
        RuleFor(x => x.EstadoCivilId).NotEmpty();
        RuleFor(x => x.Telefono).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Direccion).NotEmpty().MaximumLength(500);
    }
}
