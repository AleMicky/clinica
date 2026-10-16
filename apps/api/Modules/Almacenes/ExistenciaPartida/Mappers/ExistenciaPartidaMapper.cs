using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Dtos;
using Riok.Mapperly.Abstractions;
using ExistenciaPartidaEntity = Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity.ExistenciaPartida;

namespace Clinica.Api.Modules.Almacenes.ExistenciaPartida.Mappers;

[Mapper]
public static partial class ExistenciaPartidaMapper
{
    [MapperIgnoreSource(nameof(ExistenciaPartidaEntity.Existencia))]
    [MapperIgnoreSource(nameof(ExistenciaPartidaEntity.PartidaInventario))]
    public static partial ExistenciaPartidaResponse ToResponse(
        ExistenciaPartidaEntity entity);

    public static partial List<ExistenciaPartidaResponse> ToResponse(
        IEnumerable<ExistenciaPartidaEntity> entities);

    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.Id))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.Activo))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.Existencia))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.PartidaInventario))]
    public static partial ExistenciaPartidaEntity ToEntity(
        CreateExistenciaPartidaRequest request);

    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.Id))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.Activo))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.Existencia))]
    [MapperIgnoreTarget(nameof(ExistenciaPartidaEntity.PartidaInventario))]
    public static partial void UpdateEntity(
        UpdateExistenciaPartidaRequest request,
        ExistenciaPartidaEntity entity);
}
