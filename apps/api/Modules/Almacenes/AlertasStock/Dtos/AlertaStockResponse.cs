using Clinica.Api.Modules.Almacenes.AlertasStock.Enums;

namespace Clinica.Api.Modules.Almacenes.AlertasStock.Dtos;

public sealed record AlertaStockResponse(
    TipoAlertaStock Tipo,
    int AlmacenId,
    int ProductoId,
    string Producto,
    int? LoteId,
    string? NumeroLote,
    decimal Cantidad,
    decimal CantidadReservada,
    decimal CantidadDisponible,
    decimal? StockMinimo,
    DateOnly? FechaVencimiento,
    int? DiasParaVencer
);