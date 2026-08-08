using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using Riok.Mapperly.Abstractions;
using TarifarioDetalleEntity = Clinica.Api.Modules.Servicios.Tarifas.Entity.TarifarioDetalle;

namespace Clinica.Api.Modules.Servicios.Tarifas.Mappers;

[Mapper]
public static partial class TarifarioDetalleMapper
{
    [MapperIgnoreSource(nameof(TarifarioDetalleEntity.Tarifario))]
    [MapperIgnoreSource(nameof(TarifarioDetalleEntity.Servicio))]
    public static partial TarifarioDetalleResponse ToResponse(
        TarifarioDetalleEntity entity
    );

    public static partial List<TarifarioDetalleResponse> ToResponse(
        IEnumerable<TarifarioDetalleEntity> entities
    );

    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Tarifario))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.TarifarioId))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Servicio))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.ServicioId))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Activo))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.ModificadoPor))]
    public static partial TarifarioDetalleEntity ToEntity(
        CreateTarifarioDetalleRequest request
    );

    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Tarifario))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.TarifarioId))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Servicio))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.ServicioId))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Activo))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateTarifarioDetalleRequest request,
        TarifarioDetalleEntity entity
    );
}
