using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.Existencia.Entity;

public sealed class Existencia : AuditableEntity
{
    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public int? LoteId { get; set; }
    public LoteEntity? Lote { get; set; }

    public decimal Cantidad { get; set; }
    public decimal CantidadReservada { get; set; }

    public decimal CantidadDisponible => Cantidad - CantidadReservada;
}
