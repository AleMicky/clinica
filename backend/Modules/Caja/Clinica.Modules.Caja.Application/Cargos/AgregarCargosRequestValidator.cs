using FluentValidation;

namespace Clinica.Modules.Caja.Application.Cargos;

public sealed class AgregarCargosRequestValidator : AbstractValidator<AgregarCargosRequest>
{
    public AgregarCargosRequestValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.ModuloOrigen).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntidadOrigen).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ReferenciaId).NotEmpty();
        RuleFor(x => x.Observaciones).MaximumLength(2000);
        RuleFor(x => x.Lineas).NotEmpty().WithMessage("Debe incluir al menos una línea de cargo.");
        RuleForEach(x => x.Lineas).SetValidator(new AgregarCargosLineaRequestValidator());
    }
}

public sealed class AgregarCargosLineaRequestValidator : AbstractValidator<AgregarCargosLineaRequest>
{
    public AgregarCargosLineaRequestValidator()
    {
        RuleFor(x => x.Concepto).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Codigo).MaximumLength(50);
        RuleFor(x => x.Cantidad).GreaterThan(0);
        RuleFor(x => x.MontoUnitario).GreaterThanOrEqualTo(0);
    }
}
