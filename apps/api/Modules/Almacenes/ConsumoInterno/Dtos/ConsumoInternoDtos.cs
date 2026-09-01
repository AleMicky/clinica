using Clinica.Api.Modules.Almacenes.ConsumoInterno.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Dtos;

public sealed record ConsumoInternoDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal Cantidad { get; init; }
}

public abstract record ConsumoInternoRequest
{
    public required string Numero { get; init; }
    public required int AlmacenId { get; init; }
    public required int AreaId { get; init; }
    public required DateTime Fecha { get; init; }
    public string? ReferenciaTipo { get; init; }
    public int? ReferenciaId { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<ConsumoInternoDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateConsumoInternoRequest : ConsumoInternoRequest;

public sealed record UpdateConsumoInternoRequest : ConsumoInternoRequest;

public sealed record AnularConsumoInternoRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record ConsumoInternoDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal Cantidad { get; init; }
}

public sealed record ConsumoInternoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public int AreaId { get; init; }
    public string? AreaNombre { get; init; }

    public DateTime Fecha { get; init; }

    public string? ReferenciaTipo { get; init; }
    public int? ReferenciaId { get; init; }

    public string? Observacion { get; init; }

    public EstadoConsumoInterno Estado { get; init; }

    public int? MovimientoInventarioId { get; init; }

    public IReadOnlyCollection<ConsumoInternoDetalleResponse> Detalles { get; init; } = [];
}