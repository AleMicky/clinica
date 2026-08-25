using Clinica.Api.Modules.Seguridad.OpcionMenu.Dtos;
using Riok.Mapperly.Abstractions;
using OpcionMenuEntity = Clinica.Api.Modules.Seguridad.OpcionMenu.Entity.OpcionMenu;

namespace Clinica.Api.Modules.Seguridad.OpcionMenu.Mappers;

[Mapper]
public static partial class OpcionMenuMapper
{
    [MapperIgnoreSource(nameof(OpcionMenuEntity.Padre))]
    [MapperIgnoreSource(nameof(OpcionMenuEntity.Hijos))]
    public static partial OpcionMenuResponse ToResponse(
        OpcionMenuEntity entity
    );

    [MapperIgnoreSource(nameof(OpcionMenuEntity.Padre))]
    [MapperIgnoreSource(nameof(OpcionMenuEntity.Hijos))]
    public static partial List<OpcionMenuResponse> ToResponse(
        IEnumerable<OpcionMenuEntity> entities
    );

    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Id))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Padre))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Hijos))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Activo))]
    public static partial OpcionMenuEntity ToEntity(
        CreateOpcionMenuRequest request
    );

    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Id))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Padre))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Hijos))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(OpcionMenuEntity.Activo))]
    public static partial void UpdateEntity(
        UpdateOpcionMenuRequest request,
        OpcionMenuEntity entity
    );
}