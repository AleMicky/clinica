using Clinica.Api.Modules.RecursosHumanos.TipoArea.Dtos;
using Riok.Mapperly.Abstractions;
using TipoAreaEntity = Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity.TipoArea;

namespace Clinica.Api.Modules.RecursosHumanos.TipoArea.Mappers;

[Mapper]
public static partial class TipoAreaMapper
{
    public static partial TipoAreaResponse ToResponse(
        TipoAreaEntity entity
    );

    public static partial List<TipoAreaResponse> ToResponse(
        IEnumerable<TipoAreaEntity> entities
    );

    [MapperIgnoreTarget(nameof(TipoAreaEntity.Id))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.Activo))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.Areas))]
    public static partial TipoAreaEntity ToEntity(
        CreateTipoAreaRequest request
    );

    [MapperIgnoreTarget(nameof(TipoAreaEntity.Id))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.Activo))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(TipoAreaEntity.Areas))]
    public static partial void UpdateEntity(
        UpdateTipoAreaRequest request,
        TipoAreaEntity entity
    );
}