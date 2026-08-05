using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.Catalogo.Mappers;

[Mapper]
public static partial class CatalogoItemMapper
{
    [MapperIgnoreSource(nameof(CatalogoItem.CatalogoGrupo))]
    public static partial CatalogoItemResponse ToResponse(
        CatalogoItem entity
    );

    public static partial List<CatalogoItemResponse> ToResponse(
        IEnumerable<CatalogoItem> entities
    );

    [MapperIgnoreTarget(nameof(CatalogoItem.Id))]
    [MapperIgnoreTarget(nameof(CatalogoItem.CatalogoGrupo))]
    [MapperIgnoreTarget(nameof(CatalogoItem.CatalogoGrupoId))]
    [MapperIgnoreTarget(nameof(CatalogoItem.Activo))]
    [MapperIgnoreTarget(nameof(CatalogoItem.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CatalogoItem.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CatalogoItem.CreadoPor))]
    [MapperIgnoreTarget(nameof(CatalogoItem.ModificadoPor))]
    public static partial CatalogoItem ToEntity(
        CreateCatalogoItemRequest request
    );

    [MapperIgnoreTarget(nameof(CatalogoItem.Id))]
    [MapperIgnoreTarget(nameof(CatalogoItem.CatalogoGrupo))]
    [MapperIgnoreTarget(nameof(CatalogoItem.CatalogoGrupoId))]
    [MapperIgnoreTarget(nameof(CatalogoItem.Activo))]
    [MapperIgnoreTarget(nameof(CatalogoItem.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CatalogoItem.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CatalogoItem.CreadoPor))]
    [MapperIgnoreTarget(nameof(CatalogoItem.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateCatalogoItemRequest request,
        CatalogoItem entity
    );
}