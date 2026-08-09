using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Riok.Mapperly.Abstractions;
using ConvenioTarifarioEntity =
    Clinica.Api.Modules.Servicios.Convenios.Entity.ConvenioTarifario;
using TarifarioEntity =
    Clinica.Api.Modules.Servicios.Tarifas.Entity.Tarifario;

namespace Clinica.Api.Modules.Servicios.Convenios.Mappers;

[Mapper]
public static partial class ConvenioTarifarioMapper
{
    [MapperIgnoreSource(nameof(ConvenioTarifarioEntity.Convenio))]
    [MapperIgnoreSource(nameof(ConvenioTarifarioEntity.TarifarioId))]
    public static partial ConvenioTarifarioResponse ToResponse(
        ConvenioTarifarioEntity entity
    );

    public static partial List<ConvenioTarifarioResponse> ToResponse(
        IEnumerable<ConvenioTarifarioEntity> entities
    );

    [MapperIgnoreSource(nameof(TarifarioEntity.Descripcion))]
    [MapperIgnoreSource(nameof(TarifarioEntity.MonedaId))]
    [MapperIgnoreSource(nameof(TarifarioEntity.Moneda))]
    [MapperIgnoreSource(nameof(TarifarioEntity.Detalles))]
    [MapperIgnoreSource(nameof(TarifarioEntity.Convenios))]
    [MapperIgnoreSource(nameof(TarifarioEntity.FechaInicio))]
    [MapperIgnoreSource(nameof(TarifarioEntity.FechaFin))]
    [MapperIgnoreSource(nameof(TarifarioEntity.EsPrincipal))]
    [MapperIgnoreSource(nameof(TarifarioEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(TarifarioEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(TarifarioEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(TarifarioEntity.ModificadoPor))]
    [MapperIgnoreSource(nameof(TarifarioEntity.Activo))]
    private static partial TarifarioResponse ToTarifarioResponse(
        TarifarioEntity entity
    );

    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Id))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Convenio))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.ConvenioId))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.Tarifario))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaInicio))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaFin))]
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
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaInicio))]
    [MapperIgnoreTarget(nameof(ConvenioTarifarioEntity.FechaFin))]
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