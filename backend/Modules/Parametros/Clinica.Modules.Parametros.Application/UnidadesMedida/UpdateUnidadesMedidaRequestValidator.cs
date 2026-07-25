using FluentValidation;

namespace Clinica.Modules.Parametros.Application.UnidadesMedida;

public class UpdateUnidadesMedidaRequestValidator : AbstractValidator<UpdateUnidadesMedidaRequest>
{
    public UpdateUnidadesMedidaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Simbolo).NotEmpty().MaximumLength(50);
    }
}
