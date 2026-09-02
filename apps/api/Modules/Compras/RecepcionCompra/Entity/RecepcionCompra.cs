using Clinica.Api.Modules.Compras.RecepcionCompra.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using OrdenCompraEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompra;
using MovimientoInventarioEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Entity;

public sealed class RecepcionCompra : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int OrdenCompraId { get; set; }
    public OrdenCompraEntity OrdenCompra { get; set; } = null!;

    public int ProveedorId { get; set; }
    public ProveedorEntity Proveedor { get; set; } = null!;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public DateTime FechaRecepcion { get; set; }

    public EstadoRecepcionCompra Estado { get; set; } = EstadoRecepcionCompra.Borrador;

    public string? NumeroFactura { get; set; }

    public string? NumeroRemision { get; set; }

    public string? RecibidoPorId { get; set; }

    public string? Observacion { get; set; }

    public int? MovimientoInventarioId { get; set; }

    public MovimientoInventarioEntity? MovimientoInventario { get; set; }

    public ICollection<RecepcionCompraDetalle> Detalles { get; set; } = [];
}