using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Riok.Mapperly.Abstractions;

using MovimientoInventarioDetalleEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventarioDetalle;
using MovimientoInventarioEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Mappers;

[Mapper]
public static partial class MovimientoInventarioMapper
{
    // ENTITY -> RESPONSE
    [MapperIgnoreSource(nameof(MovimientoInventarioEntity.Detalles))]
    [MapperIgnoreSource(nameof(MovimientoInventarioEntity.TipoMovimientoInventario))]
    [MapperIgnoreSource(nameof(MovimientoInventarioEntity.Almacen))]
    public static partial MovimientoInventarioResponse ToResponse(
        MovimientoInventarioEntity entity);


    // CREATE REQUEST -> ENTITY
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Numero))] // Añadido: Se genera vía CorrelativoAsync en el servicio
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
    public static partial MovimientoInventarioEntity ToEntity(CreateMovimientoInventarioRequest request);


    // INTEGRACION REQUEST -> ENTITY
    [MapperIgnoreSource(nameof(MovimientoInventarioIntegracionRequest.TipoMovimiento))]
    [MapperIgnoreSource(nameof(MovimientoInventarioIntegracionRequest.Detalles))]

    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Numero))] // Añadido: Se genera vía CorrelativoAsync en el servicio
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Detalles))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.TipoMovimientoInventarioId))] // Añadido: Se obtiene consultando la BD
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.TipoMovimientoInventario))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Almacen))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Estado))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaConfirmacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.FechaAnulacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.MotivoAnulacion))]
    [MapperIgnoreTarget(nameof(MovimientoInventarioEntity.Observacion))] // Añadido: Integración no envía observación
    public static partial MovimientoInventarioEntity ToEntity(
        MovimientoInventarioIntegracionRequest request);


    // DETALLE ENTITY -> RESPONSE
    [MapperIgnoreSource(nameof(MovimientoInventarioDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(MovimientoInventarioDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(MovimientoInventarioDetalleEntity.MovimientoInventario))]
    public static partial MovimientoInventarioDetalleResponse ToResponse(
        MovimientoInventarioDetalleEntity entity);


    public static partial List<MovimientoInventarioDetalleResponse> ToResponse(
        IEnumerable<MovimientoInventarioDetalleEntity> entities);
}