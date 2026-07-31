using FluentValidation;

namespace Clinica.Modules.Almacen.Application.Solicitudes;

public sealed class CreateSolicitudRequestValidator : AbstractValidator<CreateSolicitudRequest>
{
    public CreateSolicitudRequestValidator()
    {
        RuleFor(x => x.AreaSolicitanteId).NotEmpty();
        RuleFor(x => x.EmpleadoSolicitanteId).NotEmpty();
        RuleFor(x => x.AlmacenId).NotEmpty();
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.ProductoId).NotEmpty();
            d.RuleFor(x => x.CantidadSolicitada).GreaterThan(0);
        });
    }
}

public sealed class AprobarSolicitudRequestValidator : AbstractValidator<AprobarSolicitudRequest>
{
    public AprobarSolicitudRequestValidator()
    {
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.DetalleId).NotEmpty();
            d.RuleFor(x => x.CantidadAprobada).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed class AtenderSolicitudRequestValidator : AbstractValidator<AtenderSolicitudRequest>
{
    public AtenderSolicitudRequestValidator()
    {
        RuleFor(x => x.Detalles).NotEmpty();
        RuleForEach(x => x.Detalles).ChildRules(d =>
        {
            d.RuleFor(x => x.DetalleId).NotEmpty();
            d.RuleFor(x => x.CantidadEntregar).GreaterThan(0);
        });
    }
}
