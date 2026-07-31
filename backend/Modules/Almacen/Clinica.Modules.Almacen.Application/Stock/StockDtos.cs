using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Stock;

public sealed record DisponibilidadProductoResponse(
    Guid ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    decimal CantidadDisponible,
    decimal StockMinimo,
    bool BajoMinimo,
    IReadOnlyList<DisponibilidadLoteResponse> Lotes);

public sealed record DisponibilidadLoteResponse(
    Guid LoteId,
    string Numero,
    DateOnly? FechaVencimiento,
    decimal Cantidad);

public sealed record MovimientoDetalleLineaRequest(
    Guid ProductoId,
    Guid? LoteId,
    decimal Cantidad,
    decimal? CostoUnitario = null,
    string? NumeroLote = null,
    DateOnly? FechaVencimiento = null);

public sealed record RegistrarIngresoRequest(
    IReadOnlyList<MovimientoDetalleLineaRequest> Lineas,
    Guid? ProveedorId = null,
    string? Observaciones = null,
    string? ModuloOrigen = null,
    string? EntidadOrigen = null,
    Guid? ReferenciaId = null,
    Guid? AlmacenId = null);

public sealed record RegistrarSalidaRequest(
    IReadOnlyList<MovimientoDetalleLineaRequest> Lineas,
    string? Observaciones = null,
    string? ModuloOrigen = null,
    string? EntidadOrigen = null,
    Guid? ReferenciaId = null,
    bool UsarFefo = true,
    Guid? AlmacenId = null);

public sealed record RegistrarAjusteRequest(
    IReadOnlyList<MovimientoDetalleLineaRequest> Lineas,
    string? Observaciones = null,
    Guid? EmpleadoId = null,
    Guid? AlmacenId = null);

public sealed record RegistrarBajaRequest(
    IReadOnlyList<MovimientoDetalleLineaRequest> Lineas,
    string? Observaciones = null,
    Guid? EmpleadoId = null,
    Guid? AlmacenId = null);

public sealed record RegistrarTransferenciaRequest(
    IReadOnlyList<MovimientoDetalleLineaRequest> Lineas,
    string? Observaciones = null,
    Guid? EmpleadoId = null,
    Guid? AlmacenOrigenId = null,
    Guid? AlmacenDestinoId = null);

public sealed record DescontarFefoRequest(
    Guid ProductoId,
    decimal Cantidad,
    string? ModuloOrigen = null,
    string? EntidadOrigen = null,
    Guid? ReferenciaId = null,
    string? Observaciones = null,
    Guid? AlmacenId = null);

public sealed record DescontarFefoLineaResponse(
    Guid LoteId,
    string NumeroLote,
    DateOnly? FechaVencimiento,
    decimal Cantidad);

public sealed record DescontarFefoResponse(
    Guid MovimientoId,
    string NumeroMovimiento,
    IReadOnlyList<DescontarFefoLineaResponse> Lineas);

public sealed record MovimientoDetalleResponse(
    Guid Id,
    Guid ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    Guid? LoteId,
    string? LoteNumero,
    decimal Cantidad,
    decimal? CostoUnitario);

public sealed record MovimientoResponse(
    Guid Id,
    string Numero,
    string Tipo,
    DateTime Fecha,
    string Estado,
    string? Observaciones,
    string? ModuloOrigen,
    string? EntidadOrigen,
    Guid? ReferenciaId,
    Guid? ProveedorId,
    Guid? WorkflowInstanceId,
    bool RequiereAprobacion,
    IReadOnlyList<MovimientoDetalleResponse> Detalles,
    Guid? AlmacenOrigenId = null,
    Guid? AlmacenDestinoId = null);

public sealed record MovimientoListItemResponse(
    Guid Id,
    string Numero,
    string Tipo,
    DateTime Fecha,
    string Estado,
    bool RequiereAprobacion,
    Guid? WorkflowInstanceId);

public sealed class MovimientoPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public string? Tipo { get; set; }
    public string? Estado { get; set; }
}

public sealed record AplicarMovimientoRequest(Guid? EmpleadoId = null);
