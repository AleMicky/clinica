using Clinica.Api.Modules.Almacenes.AjusteInventario.Dtos;
using Riok.Mapperly.Abstractions;
using AjusteInventarioDetalleEntity = Clinica.Api.Modules.Almacenes.AjusteInventario.Entity.AjusteInventarioDetalle;
using AjusteInventarioEntity = Clinica.Api.Modules.Almacenes.AjusteInventario.Entity.AjusteInventario;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Mappers;

[Mapper]
public static partial class AjusteInventarioMapper
{
    [MapperIgnoreSource(nameof(AjusteInventarioEntity.Detalles))]
    [MapperIgnoreSource(nameof(AjusteInventarioEntity.Almacen))]
    [MapperIgnoreSource(nameof(AjusteInventarioEntity.MovimientoInventario))]
    public static partial AjusteInventarioResponse ToResponse(
        AjusteInventarioEntity entity);

    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.Detalles))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.Almacen))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.MovimientoInventario))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.Estado))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.MovimientoInventarioId))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.FechaConfirmacion))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.FechaAnulacion))]
    [MapperIgnoreTarget(nameof(AjusteInventarioEntity.MotivoAnulacion))]
    public static partial AjusteInventarioEntity ToEntity(
        CreateAjusteInventarioRequest request);

    [MapperIgnoreSource(nameof(AjusteInventarioDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(AjusteInventarioDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(AjusteInventarioDetalleEntity.AjusteInventario))]
    public static partial AjusteInventarioDetalleResponse ToResponse(
        AjusteInventarioDetalleEntity entity);

    public static partial List<AjusteInventarioDetalleResponse> ToResponse(
        IEnumerable<AjusteInventarioDetalleEntity> entities);
}
