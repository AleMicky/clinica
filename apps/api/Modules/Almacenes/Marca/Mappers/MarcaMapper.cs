using Clinica.Api.Modules.Almacenes.Marca.Dtos;
using Riok.Mapperly.Abstractions;
using MarcaEntity = Clinica.Api.Modules.Almacenes.Marca.Entity.Marca;

namespace Clinica.Api.Modules.Almacenes.Marca.Mappers;

[Mapper]
public static partial class MarcaMapper
{
    public static partial MarcaResponse ToResponse(
        MarcaEntity entity);

    public static partial List<MarcaResponse> ToResponse(
        IEnumerable<MarcaEntity> entities);

    [MapperIgnoreTarget(nameof(MarcaEntity.Id))]
    [MapperIgnoreTarget(nameof(MarcaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MarcaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MarcaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MarcaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MarcaEntity.ModificadoPor))]
    public static partial MarcaEntity ToEntity(
        CreateMarcaRequest request);

    [MapperIgnoreTarget(nameof(MarcaEntity.Id))]
    [MapperIgnoreTarget(nameof(MarcaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MarcaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MarcaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MarcaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MarcaEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateMarcaRequest request,
        MarcaEntity entity);
}
