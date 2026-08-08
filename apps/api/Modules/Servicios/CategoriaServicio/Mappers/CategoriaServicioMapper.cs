using Clinica.Api.Modules.Servicios.CategoriaServicio.Dtos;
using Riok.Mapperly.Abstractions;
using CategoriaServicioEntity = Clinica.Api.Modules.Servicios.CategoriaServicio.Entity.CategoriaServicio;

namespace Clinica.Api.Modules.Servicios.CategoriaServicio.Mappers;

[Mapper]
public static partial class CategoriaServicioMapper
{
    [MapperIgnoreSource(nameof(CategoriaServicioEntity.Servicios))]
    public static partial CategoriaServicioResponse ToResponse(
        CategoriaServicioEntity entity
    );

    public static partial List<CategoriaServicioResponse> ToResponse(
        IEnumerable<CategoriaServicioEntity> entities
    );

    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.Id))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.Servicios))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.Activo))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.ModificadoPor))]
    public static partial CategoriaServicioEntity ToEntity(
        CreateCategoriaServicioRequest request
    );

    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.Id))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.Servicios))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.Activo))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CategoriaServicioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateCategoriaServicioRequest request,
        CategoriaServicioEntity entity
    );
}
