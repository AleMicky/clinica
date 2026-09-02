
using Clinica.Api.Modules.Compras.DevolucionProveedor.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using RecepcionCompraEntity =
    Clinica.Api.Modules.Compras.RecepcionCompra.Entity.RecepcionCompra;
using MovimientoInventarioEntity =
    Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Entity;

public sealed class DevolucionProveedor : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int ProveedorId { get; set; }
    public ProveedorEntity Proveedor { get; set; } = null!;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public int? RecepcionCompraId { get; set; }
    public RecepcionCompraEntity? RecepcionCompra { get; set; }

    public DateTime Fecha { get; set; }

    public EstadoDevolucionProveedor Estado { get; set; } = EstadoDevolucionProveedor.Borrador;

    public string Motivo { get; set; } = string.Empty;
    public string? Observacion { get; set; }
    public string? AutorizadoPorId { get; set; }
    public DateTime? FechaAutorizacion { get; set; }
    public int? MovimientoInventarioId { get; set; }
    public MovimientoInventarioEntity? MovimientoInventario { get; set; }
    public ICollection<DevolucionProveedorDetalle> Detalles { get; set; } = [];
}