using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Enums;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public sealed record CambiarEstadoRequest
{
    public required EstadoAdmision EstadoDestino { get; init; }
    public string? Motivo { get; init; }
}