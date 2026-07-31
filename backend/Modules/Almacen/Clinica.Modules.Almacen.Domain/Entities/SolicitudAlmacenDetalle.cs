using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class SolicitudAlmacenDetalle : AuditableEntity
{
    public Guid SolicitudAlmacenId { get; set; }
    public SolicitudAlmacen SolicitudAlmacen { get; set; } = null!;

    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public decimal CantidadSolicitada { get; set; }
    public decimal CantidadAprobada { get; set; }
    public decimal CantidadEntregada { get; set; }

    public string? Observacion { get; set; }
}