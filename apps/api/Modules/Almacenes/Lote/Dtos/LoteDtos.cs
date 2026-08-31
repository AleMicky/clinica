using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Lote.Dtos;

public abstract record LoteRequest
{
    public required int ProductoId { get; init; }
    public required string NumeroLote { get; init; }

    public DateOnly? FechaFabricacion { get; init; }
    public DateOnly? FechaVencimiento { get; init; }

    public decimal? CostoUnitario { get; init; }
}

public sealed record CreateLoteRequest : LoteRequest;

public sealed record UpdateLoteRequest : LoteRequest;

public sealed record LoteResponse : AuditableResponse
{
    public int Id { get; init; }

    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }

    public string NumeroLote { get; init; }

    public DateOnly? FechaFabricacion { get; init; }
    public DateOnly? FechaVencimiento { get; init; }

    public decimal? CostoUnitario { get; init; }
}
