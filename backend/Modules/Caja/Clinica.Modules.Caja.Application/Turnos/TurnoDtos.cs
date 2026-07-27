using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Caja.Application.Turnos;

public sealed record TurnoCajaResponse(
    Guid Id,
    Guid CajaId,
    string CajaCodigo,
    string CajaNombre,
    Guid UsuarioAperturaId,
    Guid? UsuarioCierreId,
    DateTime FechaApertura,
    DateTime? FechaCierre,
    decimal MontoInicial,
    decimal? MontoEsperado,
    decimal? MontoContado,
    decimal? Diferencia,
    string Estado,
    string? ObservacionApertura,
    string? ObservacionCierre);

public sealed record AbrirTurnoCajaRequest(
    Guid CajaId,
    decimal MontoInicial,
    string? ObservacionApertura = null);

public sealed record CerrarTurnoCajaRequest(
    decimal MontoContado,
    string? ObservacionCierre = null);

public sealed class TurnoCajaPagedRequest : PagedRequest
{
    public Guid? CajaId { get; set; }
    public string? Estado { get; set; }
    public Guid? UsuarioId { get; set; }
}
