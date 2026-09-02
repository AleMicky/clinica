using Clinica.Api.Modules.Compras.SolicitudCompra.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Dtos;

public sealed record SolicitudCompraDetalleRequest
{
    public required int ProductoId { get; init; }
    public required decimal CantidadSolicitada { get; init; }
    public string? Observacion { get; init; }
}

public abstract record SolicitudCompraRequest
{
    public required int AlmacenId { get; init; }
    public required DateTime FechaSolicitud { get; init; }
    public DateTime? FechaRequerida { get; init; }
    public string? Observacion { get; init; }

    public IReadOnlyCollection<SolicitudCompraDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateSolicitudCompraRequest : SolicitudCompraRequest;

public sealed record UpdateSolicitudCompraRequest : SolicitudCompraRequest;

public sealed record AprobarSolicitudCompraRequest
{
    public string? ObservacionAprobacion { get; init; }
}

public sealed record RechazarSolicitudCompraRequest
{
    public required string MotivoRechazo { get; init; }
}

public sealed record CancelarSolicitudCompraRequest
{
    public required string MotivoCancelacion { get; init; }
}

public sealed record SolicitudCompraDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }
    public decimal CantidadSolicitada { get; init; }
    public decimal? CantidadAprobada { get; init; }
    public string? Observacion { get; init; }
}

public sealed record SolicitudCompraResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public DateTime FechaSolicitud { get; init; }
    public DateTime? FechaRequerida { get; init; }

    public EstadoSolicitudCompra Estado { get; init; }
    public string? Observacion { get; init; }

    public string? SolicitadoPorId { get; init; }
    public string? AprobadoPorId { get; init; }
    public DateTime? FechaAprobacion { get; init; }
    public string? ObservacionAprobacion { get; init; }

    public IReadOnlyCollection<SolicitudCompraDetalleResponse> Detalles { get; init; } = [];
}
