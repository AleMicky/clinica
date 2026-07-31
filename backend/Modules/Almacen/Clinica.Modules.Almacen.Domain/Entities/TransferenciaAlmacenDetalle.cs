using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class TransferenciaAlmacenDetalle : AuditableEntity
{
    public Guid TransferenciaAlmacenId { get; set; }
    public TransferenciaAlmacen TransferenciaAlmacen { get; set; } = null!;

    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public Guid? ProductoLoteOrigenId { get; set; }
    public ProductoLote? ProductoLoteOrigen { get; set; }

    public decimal CantidadSolicitada { get; set; }
    public decimal CantidadEnviada { get; set; }
    public decimal CantidadRecibida { get; set; }

    public string? Observacion { get; set; }
}