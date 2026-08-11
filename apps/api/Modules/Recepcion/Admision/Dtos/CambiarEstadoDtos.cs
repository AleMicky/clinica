using Clinica.Api.Modules.Recepcion.Admision.Entity;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public sealed record CambiarEstadoRequest
{
    public required EstadoAdmision EstadoDestino { get; init; }
    public string? Motivo { get; init; }
}