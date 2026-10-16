using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.ExistenciaPartida.Dtos;

public abstract record ExistenciaPartidaRequest
{
    public required int ExistenciaId { get; init; }
    public required int PartidaInventarioId { get; init; }
    public decimal Cantidad { get; init; }
    public decimal CantidadReservada { get; init; }
}

public sealed record CreateExistenciaPartidaRequest : ExistenciaPartidaRequest;

public sealed record UpdateExistenciaPartidaRequest : ExistenciaPartidaRequest;

public sealed record ExistenciaPartidaResponse : AuditableResponse
{
    public int Id { get; init; }

    public int ExistenciaId { get; init; }
    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }

    public int PartidaInventarioId { get; init; }
    public string? NumeroPartida { get; init; }
    public DateOnly? FechaVencimiento { get; init; }
    public decimal CostoUnitario { get; init; }

    public decimal Cantidad { get; init; }
    public decimal CantidadReservada { get; init; }
    public decimal CantidadDisponible { get; init; }
}
