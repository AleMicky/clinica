using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Recepcion.Admision.Validators;

public abstract class AdmisionRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : AdmisionRequest
{
    protected AdmisionRequestValidator()
    {
        RuleFor(x => x.Numero)
            .NotEmpty()
            .WithMessage("El número es obligatorio.")
            .MaximumLength(20)
            .WithMessage("El número no puede superar los 20 caracteres.");

        RuleFor(x => x.PacienteId)
            .GreaterThan(0)
            .WithMessage("El paciente es obligatorio.");

        RuleFor(x => x.FechaHora)
            .NotEmpty()
            .WithMessage("La fecha y hora son obligatorias.");

        RuleFor(x => x.Estado)
            .IsInEnum()
            .WithMessage("El estado de admisión no es válido.");

        RuleFor(x => x.Observacion)
            .MaximumLength(500)
            .WithMessage("La observación no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Observacion));

        RuleFor(x => x.Detalles)
            .NotEmpty()
            .WithMessage("Debe incluir al menos un detalle de admisión.")
            .Must(detalles => detalles
                .Select(d => d.ServicioId)
                .Distinct()
                .Count() == detalles.Count)
            .WithMessage("No puede duplicar servicios dentro de la misma admisión.");

        RuleForEach(x => x.Detalles)
            .SetValidator(new AdmisionDetalleRequestValidator<AdmisionDetalleRequest>());
    }
}

public sealed class CreateAdmisionRequestValidator
    : AdmisionRequestValidator<CreateAdmisionRequest>;

public sealed class UpdateAdmisionRequestValidator
    : AdmisionRequestValidator<UpdateAdmisionRequest>;

public class AdmisionDetalleRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : AdmisionDetalleRequest
{
    public AdmisionDetalleRequestValidator()
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
    }
}

public sealed class CreateAdmisionDetalleRequestValidator
    : AdmisionDetalleRequestValidator<CreateAdmisionDetalleRequest>;

public sealed class UpdateAdmisionDetalleRequestValidator
    : AdmisionDetalleRequestValidator<UpdateAdmisionDetalleRequest>;
