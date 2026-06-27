using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Servicios;

public class UpdateServicioRequestValidator : AbstractValidator<UpdateServicioRequest>
{
    public UpdateServicioRequestValidator()
    {
        RuleFor(x => x.DepartamentoId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
