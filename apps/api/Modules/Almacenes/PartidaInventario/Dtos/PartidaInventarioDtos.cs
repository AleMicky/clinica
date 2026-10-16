using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.PartidaInventario.Dtos;

public abstract record PartidaInventarioRequest
{
    public required int ProductoId { get; init; }
    public string? NumeroPartida { get; init; }
    public DateOnly? FechaVencimiento { get; init; }
    public decimal CostoUnitario { get; init; } = 0;
}

public sealed record CreatePartidaInventarioRequest : PartidaInventarioRequest;

public sealed record UpdatePartidaInventarioRequest : PartidaInventarioRequest;

public sealed record PartidaInventarioResponse : AuditableResponse
{
    public int Id { get; init; }

    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }

    public string? NumeroPartida { get; init; }
    public DateOnly? FechaVencimiento { get; init; }
    public decimal CostoUnitario { get; init; }
}
