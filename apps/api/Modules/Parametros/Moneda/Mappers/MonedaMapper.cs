using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Riok.Mapperly.Abstractions;
using MonedaEntity = Clinica.Api.Modules.Parametros.Moneda.Entity.Moneda;

namespace Clinica.Api.Modules.Parametros.Moneda.Mappers;

[Mapper]
public static partial class MonedaMapper
{
    public static partial MonedaResponse ToResponse(
        MonedaEntity entity
    );

    public static partial List<MonedaResponse> ToResponse(
        IEnumerable<MonedaEntity> entities
    );

    [MapperIgnoreTarget(nameof(MonedaEntity.Id))]
    [MapperIgnoreTarget(nameof(MonedaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MonedaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MonedaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MonedaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MonedaEntity.ModificadoPor))]
    public static partial MonedaEntity ToEntity(
        CreateMonedaRequest request
    );

    [MapperIgnoreTarget(nameof(MonedaEntity.Id))]
    [MapperIgnoreTarget(nameof(MonedaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MonedaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MonedaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MonedaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MonedaEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateMonedaRequest request,
        MonedaEntity entity
    );
}