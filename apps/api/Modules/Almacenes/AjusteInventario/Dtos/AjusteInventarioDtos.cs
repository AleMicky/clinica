using Clinica.Api.Modules.Almacenes.AjusteInventario.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Dtos;

public sealed record AjusteInventarioDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal Cantidad { get; init; }
}

public abstract record AjusteInventarioRequest
{
    public required int AlmacenId { get; init; }
    public required TipoAjusteInventario Tipo { get; init; }
    public required DateTime Fecha { get; init; }
    public required string Motivo { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<AjusteInventarioDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateAjusteInventarioRequest : AjusteInventarioRequest;

public sealed record UpdateAjusteInventarioRequest : AjusteInventarioRequest;

public sealed record AnularAjusteInventarioRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record AjusteInventarioDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal Cantidad { get; init; }
}

public sealed record AjusteInventarioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public TipoAjusteInventario Tipo { get; init; }
    public DateTime Fecha { get; init; }
    public string Motivo { get; init; }
    public string? Observacion { get; init; }

    public EstadoAjusteInventario Estado { get; init; }

    public int? MovimientoInventarioId { get; init; }

    public DateTime? FechaConfirmacion { get; init; }
    public DateTime? FechaAnulacion { get; init; }
    public string? MotivoAnulacion { get; init; }

    public IReadOnlyCollection<AjusteInventarioDetalleResponse> Detalles { get; init; } = [];
}
