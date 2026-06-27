using FluentValidation;

namespace Clinica.Modules.Personas.Application.Empleados;

public class CreateEmpleadoRequestValidator : AbstractValidator<CreateEmpleadoRequest>
{
    public CreateEmpleadoRequestValidator()
    {
        RuleFor(x => x.PersonaId).NotEmpty();
        RuleFor(x => x.CodigoEmpleado).NotEmpty().MaximumLength(30);
        RuleFor(x => x.AreaId).NotEmpty();
        RuleFor(x => x.DepartamentoId).NotEmpty();
        RuleFor(x => x.ServicioId).NotEmpty();
        RuleFor(x => x.ProfesionId).NotEmpty();
        RuleFor(x => x.CargoId).NotEmpty();
    }
}
