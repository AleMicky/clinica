using FluentValidation;

namespace Clinica.Modules.RecursosHumanos.Application.GrupoProgramacion;

public class CreateGrupoProgramacionRequestValidator : AbstractValidator<CreateGrupoProgramacionRequest>
{
    public CreateGrupoProgramacionRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.AreaId).NotEmpty();
    }
}

public class UpdateGrupoProgramacionRequestValidator : AbstractValidator<UpdateGrupoProgramacionRequest>
{
    public UpdateGrupoProgramacionRequestValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descripcion).MaximumLength(500);
        RuleFor(x => x.AreaId).NotEmpty();
    }
}

public class SetGrupoProgramacionEmpleadosRequestValidator
    : AbstractValidator<SetGrupoProgramacionEmpleadosRequest>
{
    public SetGrupoProgramacionEmpleadosRequestValidator()
    {
        RuleFor(x => x.EmpleadoIds).NotNull();
    }
}
