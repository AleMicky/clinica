using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Caja.Application.Movimientos;

public sealed record RegistrarMovimientoCajaRequest(
    Guid ConceptoCajaId,
    decimal Importe,
    Guid? MetodoPagoId,
    string? Descripcion);

public sealed record MovimientoCajaResponse(
    Guid Id,
    string Numero,
    Guid TurnoCajaId,
    Guid ConceptoCajaId,
    string ConceptoCodigo,
    string ConceptoNombre,
    string TipoMovimiento,
    DateTime Fecha,
    decimal Importe,
    Guid? MetodoPagoId,
    string? MetodoPagoCodigo,
    Guid? PagoId,
    string? Descripcion,
    string Estado,
    string? CreatedBy);

public sealed record ResumenTurnoCajaResponse(
    Guid TurnoId,
    decimal MontoInicial,
    decimal Ingresos,
    decimal Egresos,
    decimal IngresosEfectivo,
    decimal EgresosEfectivo,
    decimal EfectivoEsperado,
    int TotalMovimientos);

public sealed class MovimientoCajaPagedRequest : PagedRequest
{
    public Guid? TurnoCajaId { get; set; }
    public string? TipoMovimiento { get; set; }
    public Guid? ConceptoCajaId { get; set; }
    public Guid? MetodoPagoId { get; set; }
    public string? Estado { get; set; }
    public DateTime? FechaDesde { get; set; }
    public DateTime? FechaHasta { get; set; }
}
