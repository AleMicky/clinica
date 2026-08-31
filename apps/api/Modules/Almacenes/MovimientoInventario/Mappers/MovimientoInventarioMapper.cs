using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Riok.Mapperly.Abstractions;
using MovimientoInventarioDetalleEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventarioDetalle;
using MovimientoInventarioEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Mappers;

[Mapper]
public static partial class MovimientoInventarioMapper
{
    [MapperIgnoreSource(nameof(MovimientoInventarioEntity.Detalles))]
    [MapperIgnoreSource(nameof(MovimientoInventarioEntity.TipoMovimientoInventario))]
    [MapperIgnoreSource(nameof(MovimientoInventarioEntity.Almacen))]
    public static partial MovimientoInventarioResponse ToResponse(
        MovimientoInventarioEntity entity);

    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Detalles))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.TipoMovimientoInventario))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Almacen))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Estado))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaConfirmacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaAnulacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.MotivoAnulacion))]
    public static partial MovimientoInventarioEntity ToEntity(
        CreateMovimientoInventarioRequest request);

    [MapperIgnoreSource(nameof(MovimientoInventarioDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(MovimientoInventarioDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(MovimientoInventarioDetalleEntity.MovimientoInventario))]
    public static partial MovimientoInventarioDetalleResponse ToResponse(
        MovimientoInventarioDetalleEntity entity);

    public static partial List<MovimientoInventarioDetalleResponse> ToResponse(
        IEnumerable<MovimientoInventarioDetalleEntity> entities);
}
