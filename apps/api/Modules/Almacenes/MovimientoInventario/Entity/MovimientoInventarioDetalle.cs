using Clinica.Api.Shared.Abstractions;
using MovimientoEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;



namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;

public sealed class MovimientoInventarioDetalle : AuditableEntity
{
    public int MovimientoInventarioId { get; set; }
    public MovimientoEntity MovimientoInventario { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal Cantidad { get; set; }

    public decimal? CostoUnitario { get; set; }

    public decimal? CostoTotal { get; set; }
}