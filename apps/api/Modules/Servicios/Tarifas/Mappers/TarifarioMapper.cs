using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using Riok.Mapperly.Abstractions;
using TarifarioEntity = Clinica.Api.Modules.Servicios.Tarifas.Entity.Tarifario;

namespace Clinica.Api.Modules.Servicios.Tarifas.Mappers;

[Mapper]
public static partial class TarifarioMapper
{
    [MapperIgnoreSource(nameof(TarifarioEntity.Moneda))]
    [MapperIgnoreSource(nameof(TarifarioEntity.Detalles))]
    public static partial TarifarioResponse ToResponse(
        TarifarioEntity entity
    );

    public static partial List<TarifarioResponse> ToResponse(
        IEnumerable<TarifarioEntity> entities
    );

    [MapperIgnoreTarget(nameof(TarifarioEntity.Id))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.Moneda))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.Detalles))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.MonedaId))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.ModificadoPor))]
    public static partial TarifarioEntity ToEntity(
        CreateTarifarioRequest request
    );

    [MapperIgnoreTarget(nameof(TarifarioEntity.Id))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.Moneda))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.Detalles))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.MonedaId))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TarifarioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateTarifarioRequest request,
        TarifarioEntity entity
    );
}
