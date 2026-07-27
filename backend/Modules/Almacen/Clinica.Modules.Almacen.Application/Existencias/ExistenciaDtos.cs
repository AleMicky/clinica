using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Existencias;

public sealed record ExistenciaResponse(
    Guid Id,
    Guid ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    Guid LoteId,
    string LoteNumero,
    DateOnly? FechaVencimiento,
    decimal Cantidad,
    decimal StockMinimo,
    bool BajoMinimo);

public sealed class ExistenciaPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public Guid? ProductoId { get; set; }
    public bool? SoloBajoMinimo { get; set; }
    public bool? SoloNoVencidos { get; set; }
}

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
