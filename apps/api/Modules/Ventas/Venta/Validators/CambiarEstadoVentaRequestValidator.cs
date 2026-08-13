using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using FluentValidation;

namespace Clinica.Api.Modules.Ventas.Venta.Validators;

public sealed class CambiarEstadoVentaRequestValidator
    : AbstractValidator<CambiarEstadoVentaRequest>
{
    public CambiarEstadoVentaRequestValidator()
    {
        RuleFor(x => x.EstadoDestino)
            .IsInEnum()
            .WithMessage("El estado de destino no es válido.");

        RuleFor(x => x.Motivo)
            .MaximumLength(500)
            .WithMessage("El motivo no puede superar los 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Motivo));
    }
}