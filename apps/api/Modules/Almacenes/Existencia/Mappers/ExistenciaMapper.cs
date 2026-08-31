using Clinica.Api.Modules.Almacenes.Existencia.Dtos;
using Riok.Mapperly.Abstractions;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;

namespace Clinica.Api.Modules.Almacenes.Existencia.Mappers;

[Mapper]
public static partial class ExistenciaMapper
{
    [MapperIgnoreSource(nameof(ExistenciaEntity.Almacen))]
    [MapperIgnoreSource(nameof(ExistenciaEntity.Producto))]
    [MapperIgnoreSource(nameof(ExistenciaEntity.Lote))]
    public static partial ExistenciaResponse ToResponse(
        ExistenciaEntity entity);

    public static partial List<ExistenciaResponse> ToResponse(
        IEnumerable<ExistenciaEntity> entities);

    [MapperIgnoreTarget(nameof(ExistenciaEntity.Id))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Activo))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Almacen))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Producto))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Lote))]
    public static partial ExistenciaEntity ToEntity(
        CreateExistenciaRequest request);

    [MapperIgnoreTarget(nameof(ExistenciaEntity.Id))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Activo))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Almacen))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Producto))]
    [MapperIgnoreTarget(nameof(ExistenciaEntity.Lote))]
    public static partial void UpdateEntity(
        UpdateExistenciaRequest request,
        ExistenciaEntity entity);
}
