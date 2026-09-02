using Clinica.Api.Modules.Compras.OrdenCompra.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using SolicitudCompraEntity = Clinica.Api.Modules.Compras.SolicitudCompra.Entity.SolicitudCompra;
using CotizacionCompraEntity = Clinica.Api.Modules.Compras.CotizacionCompra.Entity.CotizacionCompra;

namespace Clinica.Api.Modules.Compras.OrdenCompra.Entity;

public sealed class OrdenCompra : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int ProveedorId { get; set; }
    public ProveedorEntity Proveedor { get; set; } = null!;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public int? SolicitudCompraId { get; set; }
    public SolicitudCompraEntity? SolicitudCompra { get; set; }

    public int? CotizacionCompraId { get; set; }
    public CotizacionCompraEntity? CotizacionCompra { get; set; }

    public DateTime Fecha { get; set; }
    public DateTime? FechaEntregaEsperada { get; set; }
    public EstadoOrdenCompra Estado { get; set; } = EstadoOrdenCompra.Borrador;

    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal Impuesto { get; set; }
    public decimal Total { get; set; }
    public string? CondicionPago { get; set; }
    public string? Observacion { get; set; }
    public string? AprobadoPorId { get; set; }
    public DateTime? FechaAprobacion { get; set; }
    public ICollection<OrdenCompraDetalle> Detalles { get; set; } = [];

   // public ICollection<RecepcionCompra> Recepciones { get; set; } = [];
}