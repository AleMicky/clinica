using Clinica.Api.Shared.Abstractions;
using ReservaEntity = Clinica.Api.Modules.Almacenes.ReservaStock.Entity.ReservaStock;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.ReservaStock.Entity;

public sealed class ReservaStockDetalle : AuditableEntity
{
    public int ReservaStockId { get; set; }
    public ReservaEntity ReservaStock { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal CantidadReservada { get; set; }

    public decimal CantidadConsumida { get; set; }
}