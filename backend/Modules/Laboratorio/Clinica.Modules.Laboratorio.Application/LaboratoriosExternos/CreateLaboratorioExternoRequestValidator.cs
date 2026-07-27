using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.LaboratoriosExternos;

public class CreateLaboratorioExternoRequestValidator : AbstractValidator<CreateLaboratorioExternoRequest>
{
    public CreateLaboratorioExternoRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.Contacto).MaximumLength(200);
        RuleFor(x => x.Telefono).MaximumLength(50);
        RuleFor(x => x.Email).EmailAddress().MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
