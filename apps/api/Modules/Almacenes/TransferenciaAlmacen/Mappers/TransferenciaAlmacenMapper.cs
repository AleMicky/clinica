using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Dtos;
using Riok.Mapperly.Abstractions;
using TransferenciaAlmacenDetalleEntity = Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity.TransferenciaAlmacenDetalle;
using TransferenciaAlmacenEntity = Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity.TransferenciaAlmacen;

namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Mappers;

[Mapper]
public static partial class TransferenciaAlmacenMapper
{
    [MapperIgnoreSource(nameof(TransferenciaAlmacenEntity.Detalles))]
    [MapperIgnoreSource(nameof(TransferenciaAlmacenEntity.AlmacenOrigen))]
    [MapperIgnoreSource(nameof(TransferenciaAlmacenEntity.AlmacenDestino))]
    public static partial TransferenciaAlmacenResponse ToResponse(
        TransferenciaAlmacenEntity entity);

    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.Id))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.Activo))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.Detalles))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.AlmacenOrigen))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.AlmacenDestino))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.Estado))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.FechaAprobacion))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.FechaDespacho))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.FechaRecepcion))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.SolicitadoPorId))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.AprobadoPorId))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.DespachadoPorId))]
    [MapperIgnoreTarget(nameof(TransferenciaAlmacenEntity.RecibidoPorId))]
    public static partial TransferenciaAlmacenEntity ToEntity(
        CreateTransferenciaAlmacenRequest request);

    [MapperIgnoreSource(nameof(TransferenciaAlmacenDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(TransferenciaAlmacenDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(TransferenciaAlmacenDetalleEntity.TransferenciaAlmacen))]
    public static partial TransferenciaAlmacenDetalleResponse ToResponse(
        TransferenciaAlmacenDetalleEntity entity);

    public static partial List<TransferenciaAlmacenDetalleResponse> ToResponse(
        IEnumerable<TransferenciaAlmacenDetalleEntity> entities);
}
