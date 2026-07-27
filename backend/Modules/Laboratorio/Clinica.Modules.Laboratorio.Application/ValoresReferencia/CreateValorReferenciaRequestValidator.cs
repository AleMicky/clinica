using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.ValoresReferencia;

public class CreateValorReferenciaRequestValidator : AbstractValidator<CreateValorReferenciaRequest>
{
    public CreateValorReferenciaRequestValidator()
    {
        RuleFor(x => x.ParametroId).NotEmpty();
        RuleFor(x => x.Sexo).MaximumLength(20);
        RuleFor(x => x.ValorTexto).MaximumLength(200);
        RuleFor(x => x.EdadMin).GreaterThanOrEqualTo(0).When(x => x.EdadMin.HasValue);
        RuleFor(x => x.EdadMax).GreaterThanOrEqualTo(0).When(x => x.EdadMax.HasValue);

        RuleFor(x => x.EdadMax)
            .GreaterThanOrEqualTo(x => x.EdadMin!.Value)
            .When(x => x.EdadMin.HasValue && x.EdadMax.HasValue)
            .WithMessage("La edad máxima debe ser mayor o igual a la edad mínima.");

        RuleFor(x => x.ValorMax)
            .GreaterThanOrEqualTo(x => x.ValorMin!.Value)
            .When(x => x.ValorMin.HasValue && x.ValorMax.HasValue)
            .WithMessage("El valor máximo debe ser mayor o igual al valor mínimo.");
    }
}
