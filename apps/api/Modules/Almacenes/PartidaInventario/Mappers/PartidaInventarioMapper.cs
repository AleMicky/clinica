using Clinica.Api.Modules.Almacenes.PartidaInventario.Dtos;
using Riok.Mapperly.Abstractions;
using PartidaInventarioEntity = Clinica.Api.Modules.Almacenes.PartidaInventario.Entity.PartidaInventario;

namespace Clinica.Api.Modules.Almacenes.PartidaInventario.Mappers;

[Mapper]
public static partial class PartidaInventarioMapper
{
    [MapperIgnoreSource(nameof(PartidaInventarioEntity.Producto))]
    public static partial PartidaInventarioResponse ToResponse(
        PartidaInventarioEntity entity);

    public static partial List<PartidaInventarioResponse> ToResponse(
        IEnumerable<PartidaInventarioEntity> entities);

    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.Producto))]
    public static partial PartidaInventarioEntity ToEntity(
        CreatePartidaInventarioRequest request);

    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.Id))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(PartidaInventarioEntity.Producto))]
    public static partial void UpdateEntity(
        UpdatePartidaInventarioRequest request,
        PartidaInventarioEntity entity);
}
