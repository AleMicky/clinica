using Clinica.Api.Modules.Ventas.Venta.Entity;

namespace Clinica.Api.Modules.Ventas.Venta.Dtos;

public sealed record CambiarEstadoVentaRequest
{
    public required EstadoVenta EstadoDestino { get; init; }
    public string? Motivo { get; init; }
}