using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;

namespace Clinica.Api.Modules.Almacenes.Kardex.Dtos;

public sealed record KardexFilterRequest(
    int? AlmacenId,
    int ProductoId,
    DateTime? FechaDesde,
    DateTime? FechaHasta
);

public sealed record KardexMovimientoItem(
    int MovimientoId,
    string NumeroDocumento,
    DateTime Fecha,
    string TipoMovimiento,
    NaturalezaMovimiento Naturaleza,
    string? ReferenciaTipo,
    int? ReferenciaId,
    decimal CantidadEntrada,
    decimal? CostoUnitarioEntrada,
    decimal TotalEntrada,
    decimal CantidadSalida,
    decimal? CostoUnitarioSalida,
    decimal TotalSalida,
    decimal SaldoCantidad,
    decimal SaldoCostoUnitario,
    decimal SaldoTotal
);

public sealed record KardexReporteResponse(
    int? AlmacenId,
    string? AlmacenNombre,
    int ProductoId,
    string ProductoCodigo,
    string ProductoNombre,
    string UnidadMedida,
    decimal StockActual,
    decimal CostoPromedioActual,
    decimal ValorTotalActual,
    IReadOnlyCollection<KardexMovimientoItem> Movimientos
);
