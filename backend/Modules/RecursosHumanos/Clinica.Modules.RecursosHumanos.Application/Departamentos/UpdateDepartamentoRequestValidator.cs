using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.Departamentos;

public class UpdateDepartamentoRequestValidator : AbstractValidator<UpdateDepartamentoRequest>
{
    public UpdateDepartamentoRequestValidator()
    {
        RuleFor(x => x.AreaId).NotEmpty();
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}
