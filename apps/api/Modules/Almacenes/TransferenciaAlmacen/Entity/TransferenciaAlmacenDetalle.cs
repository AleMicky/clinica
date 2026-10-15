using Clinica.Api.Shared.Abstractions;
using TransferenciaEntity = Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity.TransferenciaAlmacen;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity;

public sealed class TransferenciaAlmacenDetalle : AuditableEntity
{
    public int TransferenciaAlmacenId { get; set; }
    public TransferenciaEntity TransferenciaAlmacen { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public decimal CantidadSolicitada { get; set; }
    public decimal CantidadAprobada { get; set; }
    public decimal CantidadDespachada { get; set; }
    public decimal CantidadRecibida { get; set; }
}