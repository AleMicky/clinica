using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Muestras;

public class TomarMuestraRequestValidator : AbstractValidator<TomarMuestraRequest>
{
    public TomarMuestraRequestValidator()
    {
        RuleFor(x => x.TomadoPorEmpleadoId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(500);

        RuleFor(x => x.SolicitudDetalleIds)
            .Must(ids => ids!.Count > 0)
            .When(x => x.SolicitudDetalleIds is not null)
            .WithMessage("Si especifica detalles, debe incluir al menos uno.");

        RuleForEach(x => x.SolicitudDetalleIds)
            .NotEmpty()
            .When(x => x.SolicitudDetalleIds is not null);
    }
}
