using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Entity;

public sealed class CotizacionCompraDetalle : AuditableEntity
{
    public int CotizacionCompraId { get; set; }
    public CotizacionCompra CotizacionCompra { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public decimal Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Descuento { get; set; }

    public decimal Subtotal { get; set; }

    public string? Observacion { get; set; }
}