using Clinica.Api.Modules.Almacenes.PartidaInventario.Entity;
using Clinica.Api.Modules.Almacenes.Producto.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Entity;

public class CirugiaGastoMaterial : AuditableEntity
{
    public int CirugiaId { get; set; }
    public Cirugia Cirugia { get; set; } = null!;

    public int ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public int? PartidaInventarioId { get; set; }
    public PartidaInventario? PartidaInventario { get; set; }

    public decimal Cantidad { get; set; }
    public decimal CostoUnitario { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal => Math.Round(Cantidad * PrecioUnitario, 2);

    public string? MomentoQuirurgico { get; set; } // Ej: "Pre-anestesia", "Tiempo principal", "Sutura y cierre", etc.
    public string? Observaciones { get; set; }
}
