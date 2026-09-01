using Clinica.Api.Modules.Almacenes.BajaInventario.Dtos;
using Riok.Mapperly.Abstractions;
using BajaInventarioDetalleEntity = Clinica.Api.Modules.Almacenes.BajaInventario.Entity.BajaInventarioDetalle;
using BajaInventarioEntity = Clinica.Api.Modules.Almacenes.BajaInventario.Entity.BajaInventario;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Mappers;

[Mapper]
public static partial class BajaInventarioMapper
{
    [MapperIgnoreSource(nameof(BajaInventarioEntity.Detalles))]
    [MapperIgnoreSource(nameof(BajaInventarioEntity.Almacen))]
    [MapperIgnoreSource(nameof(BajaInventarioEntity.MovimientoInventario))]
    public static partial BajaInventarioResponse ToResponse(
        BajaInventarioEntity entity);

    [MapperIgnoreTarget(nameof(BajaInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.Detalles))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.Almacen))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.MovimientoInventario))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.Estado))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.MovimientoInventarioId))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.FechaConfirmacion))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.FechaAnulacion))]
    [MapperIgnoreTarget(nameof(BajaInventarioEntity.MotivoAnulacion))]
    public static partial BajaInventarioEntity ToEntity(
        CreateBajaInventarioRequest request);

    [MapperIgnoreSource(nameof(BajaInventarioDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(BajaInventarioDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(BajaInventarioDetalleEntity.BajaInventario))]
    public static partial BajaInventarioDetalleResponse ToResponse(
        BajaInventarioDetalleEntity entity);

    public static partial List<BajaInventarioDetalleResponse> ToResponse(
        IEnumerable<BajaInventarioDetalleEntity> entities);
}