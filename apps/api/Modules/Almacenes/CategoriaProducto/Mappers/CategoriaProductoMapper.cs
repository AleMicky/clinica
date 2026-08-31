using Clinica.Api.Modules.Almacenes.CategoriaProducto.Dtos;
using Riok.Mapperly.Abstractions;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;

namespace Clinica.Api.Modules.Almacenes.CategoriaProducto.Mappers;

[Mapper]
public static partial class CategoriaProductoMapper
{
    [MapperIgnoreSource(nameof(CategoriaProductoEntity.Subcategorias))]
    [MapperIgnoreSource(nameof(CategoriaProductoEntity.CategoriaPadre))]
    public static partial CategoriaProductoResponse ToResponse(
        CategoriaProductoEntity entity);

    public static partial List<CategoriaProductoResponse> ToResponse(
        IEnumerable<CategoriaProductoEntity> entities);

    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.Id))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.Activo))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.CategoriaPadre))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.Subcategorias))]
    public static partial CategoriaProductoEntity ToEntity(
        CreateCategoriaProductoRequest request);

    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.Id))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.Activo))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.CategoriaPadre))]
    [MapperIgnoreTarget(nameof(CategoriaProductoEntity.Subcategorias))]
    public static partial void UpdateEntity(
        UpdateCategoriaProductoRequest request,
        CategoriaProductoEntity entity);
}
