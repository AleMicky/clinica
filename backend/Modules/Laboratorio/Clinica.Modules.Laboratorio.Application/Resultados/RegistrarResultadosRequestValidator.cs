using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Resultados;

public class RegistrarResultadosRequestValidator : AbstractValidator<RegistrarResultadosRequest>
{
    public RegistrarResultadosRequestValidator()
    {
        RuleFor(x => x.EmpleadoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(1000);

        RuleFor(x => x.Lineas)
            .NotEmpty()
            .WithMessage("Debe incluir al menos una línea de resultado.");

        RuleForEach(x => x.Lineas).SetValidator(new RegistrarResultadoLineaRequestValidator());
    }
}

public class RegistrarResultadoLineaRequestValidator : AbstractValidator<RegistrarResultadoLineaRequest>
{
    public RegistrarResultadoLineaRequestValidator()
    {
        RuleFor(x => x.ParametroId).NotEmpty();
        RuleFor(x => x.SolicitudDetalleId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(500);
        RuleFor(x => x.ValorTexto).MaximumLength(200);

        RuleFor(x => x)
            .Must(x => x.ValorNumerico.HasValue || !string.IsNullOrWhiteSpace(x.ValorTexto))
            .WithMessage("Debe indicar un valor numérico o un valor de texto.");
    }
}
