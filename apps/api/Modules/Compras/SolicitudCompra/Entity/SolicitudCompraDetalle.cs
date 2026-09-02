using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Entity;

public sealed class SolicitudCompraDetalle : AuditableEntity
{
    public int SolicitudCompraId { get; set; }
    public SolicitudCompra SolicitudCompra { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public decimal CantidadSolicitada { get; set; }
    public decimal? CantidadAprobada { get; set; }
    public string? Observacion { get; set; }
}