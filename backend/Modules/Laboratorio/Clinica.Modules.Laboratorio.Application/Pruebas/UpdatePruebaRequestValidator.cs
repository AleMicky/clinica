using FluentValidation;

namespace Clinica.Modules.Laboratorio.Application.Pruebas;

public class UpdatePruebaRequestValidator : AbstractValidator<UpdatePruebaRequest>
{
    public UpdatePruebaRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EspecialidadId).NotEmpty();
        RuleFor(x => x.TipoExamenId).NotEmpty();
        RuleFor(x => x.TipoMuestraId).NotEmpty();

        When(x => x.RequiereAyuno, () =>
        {
            RuleFor(x => x.HorasAyuno)
                .NotNull()
                .GreaterThan(0)
                .LessThanOrEqualTo(72)
                .WithMessage("Indique las horas de ayuno (1-72).");
        });

        When(x => !x.RequiereAyuno, () =>
        {
            RuleFor(x => x.HorasAyuno)
                .Must(h => h is null)
                .WithMessage("Si no requiere ayuno, HorasAyuno debe ser null.");
        });
    }
}
