using Clinica.Api.Modules.Almacenes.Almacen.Dtos;
using Riok.Mapperly.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;

namespace Clinica.Api.Modules.Almacenes.Almacen.Mappers;

[Mapper]
public static partial class AlmacenMapper
{
    public static partial AlmacenResponse ToResponse(
        AlmacenEntity entity);

    public static partial List<AlmacenResponse> ToResponse(
        IEnumerable<AlmacenEntity> entities);

    [MapperIgnoreTarget(nameof(AlmacenEntity.Id))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.Activo))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.ModificadoPor))]
    public static partial AlmacenEntity ToEntity(
        CreateAlmacenRequest request);

    [MapperIgnoreTarget(nameof(AlmacenEntity.Id))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.Activo))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AlmacenEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateAlmacenRequest request,
        AlmacenEntity entity);
}
