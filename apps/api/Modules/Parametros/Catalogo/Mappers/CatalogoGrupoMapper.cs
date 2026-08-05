using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.Catalogo.Mappers;

[Mapper]
public static partial class CatalogoGrupoMapper
{
    [MapperIgnoreSource(nameof(CatalogoGrupo.Items))]
    public static partial CatalogoGrupoResponse ToResponse(
        CatalogoGrupo entity
    );

    public static partial List<CatalogoGrupoResponse> ToResponse(
        IEnumerable<CatalogoGrupo> entities
    );

    [MapperIgnoreTarget(nameof(CatalogoGrupo.Id))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.Items))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.Activo))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.CreadoPor))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.ModificadoPor))]
    public static partial CatalogoGrupo ToEntity(
        CreateCatalogoGrupoRequest request
    );

    [MapperIgnoreTarget(nameof(CatalogoGrupo.Id))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.Items))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.Activo))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.CreadoPor))]
    [MapperIgnoreTarget(nameof(CatalogoGrupo.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateCatalogoGrupoRequest request,
        CatalogoGrupo entity
    );
}