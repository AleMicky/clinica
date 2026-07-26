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
        RuleFor(x => x.HorasAyuno).InclusiveBetween(0, 72);

        When(x => x.RequiereAyuno, () =>
        {
            RuleFor(x => x.HorasAyuno)
                .GreaterThan(0)
                .WithMessage("Indique las horas de ayuno.");
        });
    }
}
