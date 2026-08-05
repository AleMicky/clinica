using Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Mappers;

[Mapper]
public static partial class UnidadesMedidaMapper
{
    public static partial UnidadesMedidaResponse ToResponse(
        Entity.UnidadesMedida entity
    );

    public static partial List<UnidadesMedidaResponse> ToResponse(
        IEnumerable<Entity.UnidadesMedida> entities
    );

    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.Id))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.Activo))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.ModificadoPor))]
    public static partial Entity.UnidadesMedida ToEntity(
        CreateUnidadesMedidaRequest request
    );

    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.Id))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.Activo))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.UnidadesMedida.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateUnidadesMedidaRequest request,
        Entity.UnidadesMedida entity
    );
}