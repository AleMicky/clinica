using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Existencia.Dtos;

public abstract record ExistenciaRequest
{
    public required int AlmacenId { get; init; }
    public required int ProductoId { get; init; }
    public decimal Cantidad { get; init; }
    public decimal CantidadReservada { get; init; }
    public decimal CostoPromedio { get; init; }
}

public sealed record CreateExistenciaRequest : ExistenciaRequest;

public sealed record UpdateExistenciaRequest : ExistenciaRequest;

public sealed record ExistenciaResponse : AuditableResponse
{
    public int Id { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public string? ProductoCodigo { get; init; }

    public decimal Cantidad { get; init; }
    public decimal CantidadReservada { get; init; }
    public decimal CantidadDisponible { get; init; }
    public decimal CostoPromedio { get; init; }
    public decimal ValorInventario { get; init; }
}

public sealed record MovimientoStockExistenciaRequest
{
    public required int AlmacenId { get; init; }
    public required int ProductoId { get; init; }
    public required decimal Cantidad { get; init; }
    public decimal? CostoUnitario { get; init; }
}

public sealed record ReservaStockExistenciaRequest
{
    public required int AlmacenId { get; init; }
    public required int ProductoId { get; init; }
    public required decimal Cantidad { get; init; }
}

public sealed record ActualizarCostoPromedioRequest
{
    public required int AlmacenId { get; init; }
    public required int ProductoId { get; init; }
    public required decimal CostoPromedio { get; init; }
}
