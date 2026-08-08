using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Riok.Mapperly.Abstractions;
using ConvenioTarifarioEntity = Clinica.Api.Modules.Servicios.Convenios.Entity.ConvenioTarifario;

namespace Clinica.Api.Modules.Servicios.Convenios.Mappers;

[Mapper]
public static partial class ConvenioTarifarioMapper
{
    [MapperIgnoreSource(nameof(ConvenioTarifarioEntity.Convenio))]
    [MapperIgnoreSource(nameof(ConvenioTarifarioEntity.Tarifario))]
    public static partial ConvenioTarifarioResponse ToResponse(
        ConvenioTarifarioEntity entity
    );

    public static partial List<ConvenioTarifarioResponse> ToResponse(
        IEnumerable<ConvenioTarifarioEntity> entities
    );

    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Id))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Convenio))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.ConvenioId))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Tarifario))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.TarifarioId))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.ModificadoPor))]
    public static partial ConvenioTarifarioEntity ToEntity(
        CreateConvenioTarifarioRequest request
    );

    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Id))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Convenio))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.ConvenioId))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Tarifario))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.TarifarioId))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Activo))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateConvenioTarifarioRequest request,
        ConvenioTarifarioEntity entity
    );
}
