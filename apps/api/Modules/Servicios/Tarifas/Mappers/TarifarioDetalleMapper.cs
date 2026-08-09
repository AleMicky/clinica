using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using Riok.Mapperly.Abstractions;
using TarifarioDetalleEntity =
    Clinica.Api.Modules.Servicios.Tarifas.Entity.TarifarioDetalle;
using ServicioEntity =
    Clinica.Api.Modules.Servicios.Servicios.Entity.Servicio;

namespace Clinica.Api.Modules.Servicios.Tarifas.Mappers;

[Mapper]
public static partial class TarifarioDetalleMapper
{
    [MapperIgnoreSource(nameof(TarifarioDetalleEntity.Tarifario))]
    [MapperIgnoreSource(nameof(TarifarioDetalleEntity.ServicioId))]
    public static partial TarifarioDetalleResponse ToResponse(
        TarifarioDetalleEntity entity
    );

    public static partial List<TarifarioDetalleResponse> ToResponse(
        IEnumerable<TarifarioDetalleEntity> entities
    );

    [MapperIgnoreSource(nameof(ServicioEntity.Descripcion))]
    [MapperIgnoreSource(nameof(ServicioEntity.CategoriaServicioId))]
    [MapperIgnoreSource(nameof(ServicioEntity.CategoriaServicio))]
    [MapperIgnoreSource(nameof(ServicioEntity.Tarifas))]
    [MapperIgnoreSource(nameof(ServicioEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(ServicioEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(ServicioEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(ServicioEntity.ModificadoPor))]
    [MapperIgnoreSource(nameof(ServicioEntity.Activo))]
    private static partial ServicioResumenResponse ToServicioResumen(
        ServicioEntity entity
    );

    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Tarifario))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.TarifarioId))]
    [MapperIgnoreTarget(nameof(TarifarioDetalleEntity.Servicio))]
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