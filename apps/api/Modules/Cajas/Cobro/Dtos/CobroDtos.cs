using Clinica.Api.Modules.Cajas.Cobro.Enums;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.Cobro.Dtos;

public sealed record GenerarCobroDesdeVentaRequest
{
    public required int VentaPagadorId { get; init; }

    public required int CajaId { get; init; }
}

public sealed record ConfirmarCobroRequest
{
    public string? Observacion { get; init; }

    public required IReadOnlyCollection<CobroDetalleRequest> Detalles { get; init; }
}

public sealed record AnularCobroRequest
{
    public required string MotivoAnulacion { get; init; }
}

public sealed record CobroResponse : AuditableResponse
{
    public int Id { get; init; }

    public string Numero { get; init; } = string.Empty;

    public TurnoCajaInfo? TurnoCaja { get; init; }

    public VentaPagadorInfo? VentaPagador { get; init; }

    public DateTime FechaHora { get; init; }

    public decimal Total { get; init; }

    public EstadoCobro Estado { get; init; }

    public string? Observacion { get; init; }

    public string? MotivoAnulacion { get; init; }

    public DateTime? FechaHoraAnulacion { get; init; }

    public IReadOnlyCollection<CobroDetalleResponse> Detalles { get; init; } = [];
}

public sealed record VentaPagadorInfo
{
    public int Id { get; init; }

    public TipoPagador Tipo { get; init; }

    public int VentaId { get; init; }

    public string VentaNumero { get; init; } = string.Empty;

    public decimal VentaTotal { get; init; }

    public int? PacienteId { get; init; }

    public string? PacienteNombreCompleto { get; init; }

    public string? PacienteDocumento { get; init; }

    public string? NumeroHistoriaClinica { get; init; }

    public int? ConvenioId { get; init; }

    public string? ConvenioNombre { get; init; }

    public decimal Monto { get; init; }

    public EstadoVentaPagador Estado { get; init; }
}

public sealed record CobroDiarioDto
{
    public required string Fecha { get; init; }
    public decimal Monto { get; init; }
    public int Cantidad { get; init; }
}

public sealed record CobroMetodoPagoDto
{
    public required string MetodoPago { get; init; }
    public decimal Monto { get; init; }
    public int Cantidad { get; init; }
    public decimal Porcentaje { get; init; }
}

public sealed record CobroPorCajaDto
{
    public required string CajaNombre { get; init; }
    public decimal Monto { get; init; }
    public int Cantidad { get; init; }
}

public sealed record CobroMetricsResponse
{
    public int TotalCobros { get; init; }

    public int PendientesCobro { get; init; }

    public int Completados { get; init; }

    public int Anulados { get; init; }

    public decimal TotalMontoCobrado { get; init; }

    public decimal TotalMontoPendiente { get; init; }

    public decimal TicketPromedio { get; init; }

    public IReadOnlyCollection<CobroDiarioDto> TendenciaDiaria { get; init; } = [];

    public IReadOnlyCollection<CobroMetodoPagoDto> MetodosPago { get; init; } = [];

    public IReadOnlyCollection<CobroPorCajaDto> PorCaja { get; init; } = [];
}