using Clinica.Api.Modules.Almacenes.Lote.Dtos;
using Riok.Mapperly.Abstractions;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;

namespace Clinica.Api.Modules.Almacenes.Lote.Mappers;

[Mapper]
public static partial class LoteMapper
{
    [MapperIgnoreSource(nameof(LoteEntity.Producto))]
    public static partial LoteResponse ToResponse(
        LoteEntity entity);

    public static partial List<LoteResponse> ToResponse(
        IEnumerable<LoteEntity> entities);

    [MapperIgnoreTarget(nameof(LoteEntity.Id))]
    [MapperIgnoreTarget(nameof(LoteEntity.Activo))]
    [MapperIgnoreTarget(nameof(LoteEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(LoteEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(LoteEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(LoteEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(LoteEntity.Producto))]
    public static partial LoteEntity ToEntity(
        CreateLoteRequest request);

    [MapperIgnoreTarget(nameof(LoteEntity.Id))]
    [MapperIgnoreTarget(nameof(LoteEntity.Activo))]
    [MapperIgnoreTarget(nameof(LoteEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(LoteEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(LoteEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(LoteEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(LoteEntity.Producto))]
    public static partial void UpdateEntity(
        UpdateLoteRequest request,
        LoteEntity entity);
}
