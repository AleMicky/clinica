using Clinica.Api.Modules.RecursosHumanos.Area.Dtos;
using Riok.Mapperly.Abstractions;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Mappers;

[Mapper]
public static partial class AreaMapper
{
    public static partial AreaResponse ToResponse(
        AreaEntity entity
    );

    public static partial List<AreaResponse> ToResponse(
        IEnumerable<AreaEntity> entities
    );

    [MapperIgnoreTarget(nameof(AreaEntity.Id))]
    [MapperIgnoreTarget(nameof(AreaEntity.Activo))]
    [MapperIgnoreTarget(nameof(AreaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AreaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AreaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AreaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AreaEntity.TipoArea))]
    [MapperIgnoreTarget(nameof(AreaEntity.AreaPadre))]
    [MapperIgnoreTarget(nameof(AreaEntity.Subareas))]
    [MapperIgnoreTarget(nameof(AreaEntity.Asignaciones))]
    public static partial AreaEntity ToEntity(
        CreateAreaRequest request
    );

    [MapperIgnoreTarget(nameof(AreaEntity.Id))]
    [MapperIgnoreTarget(nameof(AreaEntity.Activo))]
    [MapperIgnoreTarget(nameof(AreaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AreaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AreaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AreaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AreaEntity.TipoArea))]
    [MapperIgnoreTarget(nameof(AreaEntity.AreaPadre))]
    [MapperIgnoreTarget(nameof(AreaEntity.Subareas))]
    [MapperIgnoreTarget(nameof(AreaEntity.Asignaciones))]
    public static partial void UpdateEntity(
        UpdateAreaRequest request,
        AreaEntity entity
    );
}