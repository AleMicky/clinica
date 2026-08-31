using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Dtos;
using Riok.Mapperly.Abstractions;
using TipoMovimientoInventarioEntity = Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity.TipoMovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Mappers;

[Mapper]
public static partial class TipoMovimientoInventarioMapper
{
    public static partial TipoMovimientoInventarioResponse ToResponse(
        TipoMovimientoInventarioEntity entity);

    public static partial List<TipoMovimientoInventarioResponse> ToResponse(
        IEnumerable<TipoMovimientoInventarioEntity> entities);

    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.ModificadoPor))]
    public static partial TipoMovimientoInventarioEntity ToEntity(
        CreateTipoMovimientoInventarioRequest request);

    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TipoMovimientoInventarioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateTipoMovimientoInventarioRequest request,
        TipoMovimientoInventarioEntity entity);
}
