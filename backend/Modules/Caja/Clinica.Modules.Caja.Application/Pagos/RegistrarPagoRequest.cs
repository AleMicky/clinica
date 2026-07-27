using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Caja.Application.Pagos;

public sealed record RegistrarPagoDetalleRequest(
    Guid MetodoPagoId,
    decimal Importe,
    string? NumeroReferencia = null,
    string? Observaciones = null);

public sealed record RegistrarPagoRequest(
    Guid CuentaId,
    string? Observaciones,
    IReadOnlyList<RegistrarPagoDetalleRequest> Detalles,
    Guid? EmpleadoId = null);

public sealed record AnularPagoRequest(string Motivo);

public sealed record PagoDetalleItemResponse(
    Guid Id,
    Guid MetodoPagoId,
    string MetodoPagoCodigo,
    string MetodoPagoNombre,
    decimal Importe,
    string? NumeroReferencia,
    string? Observaciones);

public sealed record AplicacionPagoResponse(
    Guid Id,
    Guid CuentaId,
    string CuentaNumero,
    decimal ImporteAplicado);

public sealed record ReciboResponse(
    Guid Id,
    string Numero,
    Guid PagoId,
    Guid PacienteId,
    DateTime FechaEmision,
    decimal Importe,
    string Estado,
    string? Observaciones);

public sealed record PagoListItemResponse(
    Guid Id,
    string Numero,
    Guid PacienteId,
    Guid CuentaId,
    Guid? TurnoCajaId,
    DateTime FechaPago,
    decimal Monto,
    string Estado,
    string? Observaciones);

public sealed record PagoDetalleCompletoResponse(
    Guid Id,
    string Numero,
    Guid PacienteId,
    Guid CuentaId,
    Guid? TurnoCajaId,
    DateTime FechaPago,
    decimal Monto,
    string Estado,
    string? Observaciones,
    DateTime CreatedAt,
    IReadOnlyList<PagoDetalleItemResponse> Detalles,
    IReadOnlyList<AplicacionPagoResponse> Aplicaciones,
    ReciboResponse? Recibo);

public sealed class PagoPagedRequest : PagedRequest
{
    public Guid? PacienteId { get; set; }
    public Guid? CuentaId { get; set; }
    public Guid? TurnoCajaId { get; set; }
    public string? Estado { get; set; }
    public string? Search { get; set; }
}
