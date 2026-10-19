using Clinica.Api.Modules.Almacenes.PartidaInventario.Entity;
using Clinica.Api.Modules.Almacenes.Producto.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Entity;

public class DispensacionDetalle : AuditableEntity
{
    public int DispensacionId { get; set; }
    public Dispensacion Dispensacion { get; set; } = null!;

    public int ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    // Partida / Lote específico para trazabilidad FEFO
    public int? PartidaInventarioId { get; set; }
    public PartidaInventario? PartidaInventario { get; set; }
    public string? Lote { get; set; }
    public DateTime? FechaVencimiento { get; set; }

    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Descuento { get; set; }
    public decimal Total { get; set; }

    // Posología / Indicación médica
    public string? Indicaciones { get; set; }
}
