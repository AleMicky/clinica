using Clinica.Api.Modules.Compras.SolicitudCompra.Dtos;
using Riok.Mapperly.Abstractions;
using SolicitudCompraDetalleEntity = Clinica.Api.Modules.Compras.SolicitudCompra.Entity.SolicitudCompraDetalle;
using SolicitudCompraEntity = Clinica.Api.Modules.Compras.SolicitudCompra.Entity.SolicitudCompra;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Mappers;

[Mapper]
public static partial class SolicitudCompraMapper
{
    [MapperIgnoreSource(nameof(SolicitudCompraEntity.Detalles))]
    [MapperIgnoreSource(nameof(SolicitudCompraEntity.Almacen))]
    public static partial SolicitudCompraResponse ToResponse(
        SolicitudCompraEntity entity);

    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.Id))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.Activo))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.Detalles))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.Almacen))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.Numero))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.Estado))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.SolicitadoPorId))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.AprobadoPorId))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.FechaAprobacion))]
    [MapperIgnoreTarget(nameof(SolicitudCompraEntity.ObservacionAprobacion))]
    public static partial SolicitudCompraEntity ToEntity(
        CreateSolicitudCompraRequest request);

    [MapperIgnoreSource(nameof(SolicitudCompraDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(SolicitudCompraDetalleEntity.SolicitudCompra))]
    public static partial SolicitudCompraDetalleResponse ToResponse(
        SolicitudCompraDetalleEntity entity);

    public static partial List<SolicitudCompraDetalleResponse> ToResponse(
        IEnumerable<SolicitudCompraDetalleEntity> entities);
}
