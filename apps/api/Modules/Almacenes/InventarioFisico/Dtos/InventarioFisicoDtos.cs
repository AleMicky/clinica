using Clinica.Api.Modules.Almacenes.InventarioFisico.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Dtos;

public sealed record InventarioFisicoDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal CantidadSistema { get; init; }
    public decimal? CantidadContada { get; init; }
}

public abstract record InventarioFisicoRequest
{
    public required int AlmacenId { get; init; }
    public required DateTime FechaInicio { get; init; }

    public string? Observacion { get; init; }

    public IReadOnlyCollection<InventarioFisicoDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateInventarioFisicoRequest : InventarioFisicoRequest;

public sealed record UpdateInventarioFisicoRequest : InventarioFisicoRequest;

public sealed record InventarioFisicoConteoDetalleRequest
{
    public required int DetalleId { get; init; }
    public required decimal CantidadContada { get; init; }
}

public sealed record RegistrarConteoInventarioFisicoRequest
{
    public IReadOnlyCollection<InventarioFisicoConteoDetalleRequest> Conteo { get; init; } = [];
}

public sealed record AnularInventarioFisicoRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record InventarioFisicoDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal CantidadSistema { get; init; }
    public decimal? CantidadContada { get; init; }
    public decimal Diferencia { get; init; }
}

public sealed record InventarioFisicoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public DateTime FechaInicio { get; init; }
    public DateTime? FechaCierre { get; init; }

    public EstadoInventarioFisico Estado { get; init; }

    public string? Observacion { get; init; }

    public int? MovimientoAjustePositivoId { get; init; }
    public int? MovimientoAjusteNegativoId { get; init; }

    public IReadOnlyCollection<InventarioFisicoDetalleResponse> Detalles { get; init; } = [];
}
