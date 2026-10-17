using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Ventas.Venta.Dtos;

public abstract record VentaRequest
{
    public required int AdmisionId { get; init; }
    public required int PacienteId { get; init; }
    public required int VendedorId { get; init; }
    public required int MonedaId { get; init; }
    public required DateTime Fecha { get; init; }
    public IReadOnlyCollection<VentaDetalleRequest> Detalles { get; init; } = [];
    public IReadOnlyCollection<VentaPagadorRequest> Pagadores { get; init; } = [];
}

public sealed record CreateVentaRequest : VentaRequest;

public sealed record UpdateVentaRequest : VentaRequest;

public sealed record VentaResponse : AuditableResponse
{
    public int Id { get; init; }
    public required string Numero { get; init; }
    public int AdmisionId { get; init; }
    public PacienteBaseInfo Paciente { get; init; }
    public EmpleadoBaseInfo Vendedor { get; init; }
    public MonedaInfo Moneda { get; init; }
    public DateTime Fecha { get; init; }
    public decimal Subtotal { get; init; }
    public decimal Descuento { get; init; }
    public decimal Total { get; init; }
    public EstadoVenta Estado { get; init; }
    public IReadOnlyCollection<VentaDetalleResponse> Detalles { get; init; } = [];
    public IReadOnlyCollection<VentaPagadorResponse> Pagadores { get; init; } = [];
}

public sealed record VentaDiariaDto
{
    public required string Fecha { get; init; }
    public decimal Monto { get; init; }
    public int Cantidad { get; init; }
}

public sealed record TopServicioDto
{
    public int ServicioId { get; init; }
    public required string Nombre { get; init; }
    public decimal Cantidad { get; init; }
    public decimal Total { get; init; }
}

public sealed record TopVendedorDto
{
    public int VendedorId { get; init; }
    public required string Nombre { get; init; }
    public int CantidadVentas { get; init; }
    public decimal TotalVendido { get; init; }
}

public sealed record VentaMetricsResponse
{
    public int TotalVentas { get; init; }
    public int Pendientes { get; init; }
    public int PendientesCobro { get; init; }
    public int Pagadas { get; init; }
    public int Anuladas { get; init; }
    public decimal MontoTotal { get; init; }
    public decimal MontoCobrado { get; init; }
    public decimal MontoPorCobrar { get; init; }
    public decimal SubtotalBruto { get; init; }
    public decimal TotalDescuentos { get; init; }
    public decimal TicketPromedio { get; init; }

    public IReadOnlyCollection<VentaDiariaDto> TendenciaDiaria { get; init; } = [];
    public IReadOnlyCollection<TopServicioDto> TopServicios { get; init; } = [];
    public IReadOnlyCollection<TopVendedorDto> TopVendedores { get; init; } = [];
}