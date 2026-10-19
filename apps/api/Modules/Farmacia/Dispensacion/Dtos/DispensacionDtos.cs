using Clinica.Api.Modules.Farmacia.Dispensacion.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Dtos;

public sealed record DispensacionDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? PartidaInventarioId { get; init; }
    public required decimal Cantidad { get; init; }
    public required decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; } = 0m;
    public string? Indicaciones { get; init; }
}

public sealed record CreateDispensacionRequest
{
    public TipoDispensacion Tipo { get; init; } = TipoDispensacion.VentaAmbulatoria;
    public required int AlmacenId { get; init; }
    public int? PacienteId { get; init; }
    public string? ClienteNombre { get; init; }
    public string? ClienteDocumento { get; init; }
    public int? MedicoId { get; init; }
    public int? AdmisionId { get; init; }
    public string? Observaciones { get; init; }
    public required List<DispensacionDetalleRequest> Detalles { get; init; } = [];
}

public sealed record RegistrarCobroDispensacionRequest
{
    public required string MetodoPago { get; init; }
    public string? ComprobanteCobro { get; init; }
    public decimal? MontoCobrado { get; init; }
}

public sealed record AnularDispensacionRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record DispensacionDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string ProductoCodigo { get; init; } = string.Empty;
    public string ProductoNombre { get; init; } = string.Empty;
    public int? PartidaInventarioId { get; init; }
    public string? Lote { get; init; }
    public DateTime? FechaVencimiento { get; init; }
    public decimal Cantidad { get; init; }
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public decimal Total { get; init; }
    public string? Indicaciones { get; init; }
}

public sealed record DispensacionResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;
    public TipoDispensacion Tipo { get; init; }
    public EstadoDispensacion Estado { get; init; }
    public DateTime Fecha { get; init; }

    public int AlmacenId { get; init; }
    public string AlmacenNombre { get; init; } = string.Empty;

    public int? PacienteId { get; init; }
    public string? PacienteNombre { get; init; }
    public string? PacienteDocumento { get; init; }
    public string? PacienteHistoriaClinica { get; init; }

    public string? ClienteNombre { get; init; }
    public string? ClienteDocumento { get; init; }

    public int? MedicoId { get; init; }
    public string? MedicoNombre { get; init; }

    public int? AdmisionId { get; init; }
    public string? AdmisionNumero { get; init; }

    public decimal Subtotal { get; init; }
    public decimal Descuento { get; init; }
    public decimal Total { get; init; }
    public string? Observaciones { get; init; }

    public DateTime? FechaCobro { get; init; }
    public string? UsuarioCobro { get; init; }
    public string? MetodoPago { get; init; }
    public string? ComprobanteCobro { get; init; }

    public DateTime? FechaEntrega { get; init; }
    public string? UsuarioEntrega { get; init; }
    public int? MovimientoInventarioId { get; init; }

    public string? MotivoAnulacion { get; init; }

    public List<DispensacionDetalleResponse> Detalles { get; init; } = [];
}

public sealed record DispensacionMetricsResponse
{
    public int TotalDispensaciones { get; init; }
    public int TotalPendientesPago { get; init; }
    public int TotalPagadas { get; init; }
    public int TotalEntregadas { get; init; }
    public decimal MontoTotalRecaudado { get; init; }
    public decimal MontoTotalPendiente { get; init; }
}

public sealed record LoteMedicamentoStockResponse
{
    public int PartidaInventarioId { get; init; }
    public string Lote { get; init; } = string.Empty;
    public DateTime? FechaVencimiento { get; init; }
    public decimal CantidadDisponible { get; init; }
}

public sealed record MedicamentoStockResponse
{
    public int ProductoId { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Categoria { get; init; }
    public string? UnidadMedida { get; init; }
    public decimal StockDisponible { get; init; }
    public decimal PrecioReferencial { get; init; }
    public List<LoteMedicamentoStockResponse> Lotes { get; init; } = [];
}
