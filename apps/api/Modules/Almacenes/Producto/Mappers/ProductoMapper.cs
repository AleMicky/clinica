using Clinica.Api.Modules.Almacenes.Producto.Dtos;
using Riok.Mapperly.Abstractions;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.Producto.Mappers;

[Mapper]
public static partial class ProductoMapper
{
    [MapperIgnoreSource(nameof(ProductoEntity.CategoriaProducto))]
    [MapperIgnoreSource(nameof(ProductoEntity.UnidadMedida))]
    public static partial ProductoResponse ToResponse(
        ProductoEntity entity);

    public static partial List<ProductoResponse> ToResponse(
        IEnumerable<ProductoEntity> entities);

    [MapperIgnoreTarget(nameof(ProductoEntity.Id))]
    [MapperIgnoreTarget(nameof(ProductoEntity.Activo))]
    [MapperIgnoreTarget(nameof(ProductoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ProductoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ProductoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ProductoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ProductoEntity.CategoriaProducto))]
    [MapperIgnoreTarget(nameof(ProductoEntity.UnidadMedida))]
    public static partial ProductoEntity ToEntity(
        CreateProductoRequest request);

    [MapperIgnoreTarget(nameof(ProductoEntity.Id))]
    [MapperIgnoreTarget(nameof(ProductoEntity.Activo))]
    [MapperIgnoreTarget(nameof(ProductoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ProductoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ProductoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ProductoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ProductoEntity.CategoriaProducto))]
    [MapperIgnoreTarget(nameof(ProductoEntity.UnidadMedida))]
    public static partial void UpdateEntity(
        UpdateProductoRequest request,
        ProductoEntity entity);
}
