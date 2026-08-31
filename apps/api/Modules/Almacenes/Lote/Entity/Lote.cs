using Clinica.Api.Shared.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.Lote.Entity;

public sealed class Lote : AuditableEntity
{
    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public string NumeroLote { get; set; } = string.Empty;

    public DateOnly? FechaFabricacion { get; set; }
    public DateOnly? FechaVencimiento { get; set; }

    public decimal? CostoUnitario { get; set; }
}