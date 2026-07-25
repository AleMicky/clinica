using FluentValidation;

namespace Clinica.Modules.Parametros.Application.UnidadesMedida;

public class CreateUnidadesMedidaRequestValidator : AbstractValidator<CreateUnidadesMedidaRequest>
{
    public CreateUnidadesMedidaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Simbolo).NotEmpty().MaximumLength(50);
    }
}
