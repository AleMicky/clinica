using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Solicitudes;

public sealed record SolicitudDetalleRequest(
    Guid ProductoId,
    decimal CantidadSolicitada,
    string? Observacion = null);

public sealed record CreateSolicitudRequest(
    Guid AreaSolicitanteId,
    Guid EmpleadoSolicitanteId,
    Guid AlmacenId,
    IReadOnlyList<SolicitudDetalleRequest> Detalles,
    string? Observacion = null);

public sealed record AprobarSolicitudDetalleRequest(
    Guid DetalleId,
    decimal CantidadAprobada);

public sealed record AprobarSolicitudRequest(
    IReadOnlyList<AprobarSolicitudDetalleRequest> Detalles);

public sealed record AtenderSolicitudDetalleRequest(
    Guid DetalleId,
    decimal CantidadEntregar);

public sealed record AtenderSolicitudRequest(
    IReadOnlyList<AtenderSolicitudDetalleRequest> Detalles);

public sealed record SolicitudDetalleResponse(
    Guid Id,
    Guid ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    decimal CantidadSolicitada,
    decimal CantidadAprobada,
    decimal CantidadEntregada,
    string? Observacion);

public sealed record SolicitudResponse(
    Guid Id,
    string Numero,
    DateTime FechaSolicitud,
    Guid AreaSolicitanteId,
    Guid EmpleadoSolicitanteId,
    Guid AlmacenId,
    string AlmacenNombre,
    string Estado,
    string? Observacion,
    IReadOnlyList<SolicitudDetalleResponse> Detalles);

public sealed record SolicitudListItemResponse(
    Guid Id,
    string Numero,
    DateTime FechaSolicitud,
    string AlmacenNombre,
    string Estado);

public sealed class SolicitudPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public string? Estado { get; set; }
}
