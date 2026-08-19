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