using Clinica.Api.Modules.Servicios.Servicios.Dtos;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Servicios.Servicios.Mappers;

using ServicioEntity = Clinica.Api.Modules.Servicios.Servicios.Entity.Servicio;

[Mapper]
public static partial class ServicioMapper
{
    [MapperIgnoreSource(nameof(ServicioEntity.CategoriaServicio))]
    [MapperIgnoreSource(nameof(ServicioEntity.Tarifas))]
    public static partial ServicioResponse ToResponse(
        ServicioEntity entity
    );

    public static partial List<ServicioResponse> ToResponse(
        IEnumerable<ServicioEntity> entities
    );

    [MapperIgnoreTarget(nameof(ServicioEntity.Id))]
    [MapperIgnoreTarget(nameof(ServicioEntity.CategoriaServicio))]
    [MapperIgnoreTarget(nameof(ServicioEntity.Tarifas))]
    [MapperIgnoreTarget(nameof(ServicioEntity.CategoriaServicioId))]
    [MapperIgnoreTarget(nameof(ServicioEntity.Activo))]
    [MapperIgnoreTarget(nameof(ServicioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ServicioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ServicioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ServicioEntity.ModificadoPor))]
    public static partial ServicioEntity ToEntity(
        CreateServicioRequest request
    );

    [MapperIgnoreTarget(nameof(ServicioEntity.Id))]
    [MapperIgnoreTarget(nameof(ServicioEntity.CategoriaServicio))]
    [MapperIgnoreTarget(nameof(ServicioEntity.Tarifas))]
    [MapperIgnoreTarget(nameof(ServicioEntity.CategoriaServicioId))]
    [MapperIgnoreTarget(nameof(ServicioEntity.Activo))]
    [MapperIgnoreTarget(nameof(ServicioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ServicioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ServicioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ServicioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateServicioRequest request,
        ServicioEntity entity
    );
}
