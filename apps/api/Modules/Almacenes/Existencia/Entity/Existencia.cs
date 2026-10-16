using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

using ExistenciaPartidaEntity = Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity.ExistenciaPartida;

namespace Clinica.Api.Modules.Almacenes.Existencia.Entity;

public sealed class Existencia : AuditableEntity
{
    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public int ProductoId { get; set; }
    public ProductoEntity Producto { get; set; } = null!;

    public decimal Cantidad { get; set; }
    public decimal CantidadReservada { get; set; }

    public decimal CantidadDisponible => Cantidad - CantidadReservada;

    public ICollection<ExistenciaPartidaEntity> ExistenciasPartidas { get; set; } = new List<ExistenciaPartidaEntity>();
}
