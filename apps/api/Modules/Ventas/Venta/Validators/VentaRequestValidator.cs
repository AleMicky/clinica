using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using FluentValidation;

namespace Clinica.Api.Modules.Ventas.Venta.Validators;

public abstract class VentaRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : VentaRequest
{
    protected VentaRequestValidator()
    {
        RuleFor(x => x.AdmisionId)
            .GreaterThan(0)
            .WithMessage("La admisión es obligatoria.");

        RuleFor(x => x.PacienteId)
            .GreaterThan(0)
            .WithMessage("El paciente es obligatorio.");

        RuleFor(x => x.MonedaId)
            .GreaterThan(0)
            .WithMessage("La moneda es obligatoria.");

        RuleFor(x => x.Fecha)
            .NotEmpty()
            .WithMessage("La fecha es obligatoria.");

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("Debe incluir al menos un detalle de venta.")
            .Must(detalles => detalles
                .Select(d => d.ServicioId)
                .Distinct()
                .Count() == detalles.Count)
            .WithMessage("No pueden haber servicios duplicados en los detalles de venta.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new VentaDetalleRequestValidator<VentaDetalleRequest>());

        RuleFor(x => x.Pagadores)
            .NotEmpty()
            .WithMessage("Debe incluir al menos un pagador.");

        RuleForEach(x => x.Pagadores)
            .SetValidator(new VentaPagadorRequestValidator<VentaPagadorRequest>());
    }
}

public sealed class CreateVentaRequestValidator
    : VentaRequestValidator<CreateVentaRequest>;

public sealed class UpdateVentaRequestValidator
    : VentaRequestValidator<UpdateVentaRequest>;

public class VentaDetalleRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : VentaDetalleRequest
{
    public VentaDetalleRequestValidator()
    {
        RuleFor(x => x.ServicioId)
            .GreaterThan(0)
            .WithMessage("El servicio es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThan(0)
            .WithMessage("La cantidad debe ser mayor a cero.");

        RuleFor(x => x.PrecioUnitario)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El precio unitario no puede ser negativo.");

        RuleFor(x => x.Descuento)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El descuento no puede ser negativo.")
            .Must((x, descuento) => descuento <= x.Cantidad * x.PrecioUnitario)
            .WithMessage("El descuento no puede superar el importe del detalle.");

        RuleFor(x => x.PorcentajeMedico)
            .InclusiveBetween(0, 100)
            .WithMessage("El porcentaje del médico debe estar entre 0 y 100.")
            .When(x => x.PorcentajeMedico.HasValue);

        RuleFor(x => x.MedicoId)
            .NotNull()
            .WithMessage("El médico es obligatorio cuando se especifica un porcentaje para el médico.")
            .When(x => x.PorcentajeMedico.HasValue);

        RuleFor(x => x.MedicoId)
            .GreaterThan(0)
            .WithMessage("El médico es obligatorio cuando se especifica un porcentaje para el médico.")
            .When(x => x.MedicoId.HasValue);
    }
}

public sealed class CreateVentaDetalleRequestValidator
    : VentaDetalleRequestValidator<CreateVentaDetalleRequest>;

public sealed class UpdateVentaDetalleRequestValidator
    : VentaDetalleRequestValidator<UpdateVentaDetalleRequest>;

public class VentaPagadorRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : VentaPagadorRequest
{
    public VentaPagadorRequestValidator()
    {
        RuleFor(x => x.Tipo)
            .IsInEnum()
            .WithMessage("El tipo de pagador no es válido.");

        RuleFor(x => x.ConvenioId)
            .NotEmpty()
            .WithMessage("El convenio es obligatorio para un pagador de convenio.")
            .When(x => x.Tipo == TipoPagador.Convenio);

        RuleFor(x => x.ConvenioId)
            .Empty()
            .WithMessage("Un pagador de paciente no puede tener convenio.")
            .When(x => x.Tipo == TipoPagador.Paciente);

        RuleFor(x => x.Monto)
            .GreaterThan(0)
            .WithMessage("El monto del pagador debe ser mayor a cero.");
    }
}

public sealed class CreateVentaPagadorRequestValidator
    : VentaPagadorRequestValidator<CreateVentaPagadorRequest>;

public sealed class UpdateVentaPagadorRequestValidator
    : VentaPagadorRequestValidator<UpdateVentaPagadorRequest>;
