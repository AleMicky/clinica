using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using OrdenCompraDetalleEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompraDetalle;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Entity;

public sealed class RecepcionCompraDetalle : AuditableEntity
{
    public int RecepcionCompraId { get; set; }
    public RecepcionCompra RecepcionCompra { get; set; } = null!;

    public int OrdenCompraDetalleId { get; set; }
    public OrdenCompraDetalleEntity OrdenCompraDetalle { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal CantidadRecibida { get; set; }

    public decimal PrecioUnitario { get; set; }

    public string? Observacion { get; set; }
}