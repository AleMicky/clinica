using Clinica.Api.Modules.Compras.CotizacionCompra.Enums;
using Clinica.Api.Shared.Abstractions;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using SolicitudCompraEntity = Clinica.Api.Modules.Compras.SolicitudCompra.Entity.SolicitudCompra;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Entity;

public sealed class CotizacionCompra : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int ProveedorId { get; set; }
    public ProveedorEntity Proveedor { get; set; } = null!;

    public int? SolicitudCompraId { get; set; }
    public SolicitudCompraEntity? SolicitudCompra { get; set; }

    public DateTime Fecha { get; set; }

    public DateTime? FechaVencimiento { get; set; }

    public EstadoCotizacionCompra Estado { get; set; } = EstadoCotizacionCompra.Borrador;

    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal Impuesto { get; set; }
    public decimal Total { get; set; }
    public string? CondicionPago { get; set; }
    public string? TiempoEntrega { get; set; }
    public string? Observacion { get; set; }

    public ICollection<CotizacionCompraDetalle> Detalles { get; set; } = [];
}