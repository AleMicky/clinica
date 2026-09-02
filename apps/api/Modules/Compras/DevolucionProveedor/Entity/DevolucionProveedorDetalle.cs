using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Entity;

public sealed class DevolucionProveedorDetalle : AuditableEntity
{
    public int DevolucionProveedorId { get; set; }
    public DevolucionProveedor DevolucionProveedor { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal Cantidad { get; set; }

    public string? Motivo { get; set; }

    public string? Observacion { get; set; }
}