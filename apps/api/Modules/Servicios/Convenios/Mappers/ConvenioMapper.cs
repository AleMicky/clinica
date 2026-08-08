using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Riok.Mapperly.Abstractions;
using ConvenioEntity = Clinica.Api.Modules.Servicios.Convenios.Entity.Convenio;

namespace Clinica.Api.Modules.Servicios.Convenios.Mappers;

[Mapper]
public static partial class ConvenioMapper
{
    public static partial ConvenioResponse ToResponse(
        ConvenioEntity entity
    );

    public static partial List<ConvenioResponse> ToResponse(
        IEnumerable<ConvenioEntity> entities
    );

    [MapperIgnoreTarget(nameof(ConvenioEntity.Id))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.Activo))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.ModificadoPor))]
    public static partial ConvenioEntity ToEntity(
        CreateConvenioRequest request
    );

    [MapperIgnoreTarget(nameof(ConvenioEntity.Id))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.Activo))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ConvenioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateConvenioRequest request,
        ConvenioEntity entity
    );
}
