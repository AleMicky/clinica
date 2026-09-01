using Clinica.Api.Modules.Almacenes.ReservaStock.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.ReservaStock.Dtos;

public sealed record ReservaStockDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal CantidadReservada { get; init; }
}

public abstract record ReservaStockRequest
{
    public required string Numero { get; init; }
    public required int AlmacenId { get; init; }
    public required string ReferenciaTipo { get; init; }
    public int? ReferenciaId { get; init; }
    public required DateTime FechaReserva { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<ReservaStockDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateReservaStockRequest : ReservaStockRequest;

public sealed record UpdateReservaStockRequest : ReservaStockRequest;

public sealed record ConfirmarReservaStockRequest
{
    public IReadOnlyCollection<ReservaDetalleCantidadRequest> Cantidades { get; init; } = [];
}

public sealed record ReservaDetalleCantidadRequest
{
    public required int DetalleId { get; init; }
    public required decimal CantidadConsumida { get; init; }
}

public sealed record CancelarReservaStockRequest
{
    public required string MotivoCancelacion { get; init; }
}

public sealed record ReservaStockDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal CantidadReservada { get; init; }
    public decimal CantidadConsumida { get; init; }
}

public sealed record ReservaStockResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int AlmacenId { get; init; }
    public string? AlmacenNombre { get; init; }

    public string ReferenciaTipo { get; init; }
    public int? ReferenciaId { get; init; }

    public DateTime FechaReserva { get; init; }

    public DateTime? FechaLiberacion { get; init; }
    public DateTime? FechaConsumo { get; init; }

    public EstadoReservaStock Estado { get; init; }

    public string? Observacion { get; init; }

    public IReadOnlyCollection<ReservaStockDetalleResponse> Detalles { get; init; } = [];
}
