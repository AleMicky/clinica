using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Transferencias;

public sealed class CreateTransferenciaRequestValidator : AbstractValidator<CreateTransferenciaRequest>
{
    public CreateTransferenciaRequestValidator()
    {
        RuleFor(x => x.AlmacenOrigenId).NotEmpty();
        RuleFor(x => x.AlmacenDestinoId).NotEmpty()
            .NotEqual(x => x.AlmacenOrigenId)
            .WithMessage("Origen y destino deben ser distintos.");
        RuleFor(x => x.EmpleadoSolicitanteId).NotEmpty();
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.ProductoId).NotEmpty();
            d.RuleFor(x => x.CantidadSolicitada).GreaterThan(0);
        });
    }
}
