using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Solicitudes;

public class DerivarDetalleRequestValidator : AbstractValidator<DerivarDetalleRequest>
{
    public DerivarDetalleRequestValidator()
    {
        RuleFor(x => x.LaboratorioExternoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(500);
    }
}
