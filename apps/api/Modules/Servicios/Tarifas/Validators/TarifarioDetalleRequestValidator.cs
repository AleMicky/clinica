using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using FluentValidation;

namespace Clinica.Api.Modules.Servicios.Tarifas.Validators;

public abstract class TarifarioDetalleRequestValidator<TRequest>
    : AbstractValidator<TRequest>
    where TRequest : TarifarioDetalleRequest
{
    protected TarifarioDetalleRequestValidator()
    {
        RuleFor(x => x.ServicioId)
            .GreaterThan(0)
            .WithMessage("El servicio es obligatorio.");

        RuleFor(x => x.Precio)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El precio debe ser mayor a cero.");
    }
}

public sealed class CreateTarifarioDetalleRequestValidator
    : TarifarioDetalleRequestValidator<CreateTarifarioDetalleRequest>;

public sealed class UpdateTarifarioDetalleRequestValidator
    : TarifarioDetalleRequestValidator<UpdateTarifarioDetalleRequest>;
