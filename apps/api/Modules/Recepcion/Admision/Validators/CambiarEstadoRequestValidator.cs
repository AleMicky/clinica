using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using FluentValidation;

namespace Clinica.Api.Modules.Recepcion.Admision.Validators;

public sealed class CambiarEstadoRequestValidator
    : AbstractValidator<CambiarEstadoRequest>
{
    public CambiarEstadoRequestValidator()
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