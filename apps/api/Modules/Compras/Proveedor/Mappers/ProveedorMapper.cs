using Clinica.Api.Modules.Compras.Proveedor.Dtos;
using Riok.Mapperly.Abstractions;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;

namespace Clinica.Api.Modules.Compras.Proveedor.Mappers;

[Mapper]
public static partial class ProveedorMapper
{
    public static partial ProveedorResponse ToResponse(
        ProveedorEntity entity);

    public static partial List<ProveedorResponse> ToResponse(
        IEnumerable<ProveedorEntity> entities);

    [MapperIgnoreTarget(nameof(ProveedorEntity.Id))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.Activo))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.ModificadoPor))]
    public static partial ProveedorEntity ToEntity(
        CreateProveedorRequest request);

    [MapperIgnoreTarget(nameof(ProveedorEntity.Id))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.Activo))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ProveedorEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateProveedorRequest request,
        ProveedorEntity entity);
}
