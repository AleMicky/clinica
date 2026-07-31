using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Transferencias;

public sealed record TransferenciaDetalleRequest(
    Guid ProductoId,
    decimal CantidadSolicitada,
    Guid? ProductoLoteOrigenId = null,
    string? Observacion = null);

public sealed record CreateTransferenciaRequest(
    Guid AlmacenOrigenId,
    Guid AlmacenDestinoId,
    Guid EmpleadoSolicitanteId,
    IReadOnlyList<TransferenciaDetalleRequest> Detalles,
    string? Observacion = null);

public sealed record TransferenciaDetalleResponse(
    Guid Id,
    Guid ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    Guid? ProductoLoteOrigenId,
    string? LoteNumero,
    decimal CantidadSolicitada,
    decimal CantidadEnviada,
    decimal CantidadRecibida,
    string? Observacion);

public sealed record TransferenciaResponse(
    Guid Id,
    string Numero,
    DateTime FechaSolicitud,
    Guid AlmacenOrigenId,
    string AlmacenOrigenNombre,
    Guid AlmacenDestinoId,
    string AlmacenDestinoNombre,
    Guid EmpleadoSolicitanteId,
    Guid? EmpleadoAprobadorId,
    Guid? EmpleadoDespachoId,
    Guid? EmpleadoRecepcionId,
    DateTime? FechaEnvio,
    DateTime? FechaRecepcion,
    string Estado,
    string? Observacion,
    IReadOnlyList<TransferenciaDetalleResponse> Detalles);

public sealed record TransferenciaListItemResponse(
    Guid Id,
    string Numero,
    DateTime FechaSolicitud,
    string AlmacenOrigenNombre,
    string AlmacenDestinoNombre,
    string Estado);

public sealed class TransferenciaPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public string? Estado { get; set; }
}

public sealed record AprobarTransferenciaRequest(Guid EmpleadoAprobadorId);
public sealed record EnviarTransferenciaRequest(Guid EmpleadoDespachoId);
public sealed record RecibirTransferenciaRequest(Guid EmpleadoRecepcionId);
public sealed record RechazarTransferenciaRequest(Guid EmpleadoId, string? Motivo = null);
