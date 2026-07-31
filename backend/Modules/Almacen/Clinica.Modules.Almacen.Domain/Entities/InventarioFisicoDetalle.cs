using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class InventarioFisicoDetalle : AuditableEntity
{
    public Guid InventarioFisicoId { get; set; }
    public InventarioFisico InventarioFisico { get; set; } = null!;

    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public Guid? ProductoLoteId { get; set; }
    public ProductoLote? ProductoLote { get; set; }

    public decimal CantidadSistema { get; set; }
    public decimal CantidadContada { get; set; }

    public decimal Diferencia => CantidadContada - CantidadSistema;

    public string? Observacion { get; set; }
}