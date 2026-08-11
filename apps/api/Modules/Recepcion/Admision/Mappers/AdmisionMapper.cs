using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Riok.Mapperly.Abstractions;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;
using AdmisionDetalleEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.AdmisionDetalle;

namespace Clinica.Api.Modules.Recepcion.Admision.Mappers;

[Mapper]
public static partial class AdmisionMapper
{
    [MapperIgnoreSource(nameof(AdmisionEntity.Paciente))]
    [MapperIgnoreSource(nameof(AdmisionEntity.Convenio))]
    [MapperIgnoreSource(nameof(AdmisionEntity.Detalles))]
    public static partial AdmisionResponse ToResponse(
        AdmisionEntity entity
    );

    public static partial List<AdmisionResponse> ToResponse(
        IEnumerable<AdmisionEntity> entities
    );

    [MapperIgnoreSource(nameof(CreateAdmisionRequest.Detalles))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Id))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Paciente))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Convenio))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Detalles))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Estado))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Activo))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.ModificadoPor))]
    public static partial AdmisionEntity ToEntity(
        CreateAdmisionRequest request
    );

    [MapperIgnoreSource(nameof(UpdateAdmisionRequest.Detalles))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Id))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Paciente))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Convenio))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Detalles))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Estado))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Activo))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateAdmisionRequest request,
        AdmisionEntity entity
    );
}

[Mapper]
public static partial class AdmisionDetalleMapper
{
    [MapperIgnoreSource(nameof(AdmisionDetalleEntity.Admision))]
    [MapperIgnoreSource(nameof(AdmisionDetalleEntity.Servicio))]
    [MapperIgnoreSource(nameof(AdmisionDetalleEntity.Medico))]
    public static partial AdmisionDetalleResponse ToResponse(
        AdmisionDetalleEntity entity
    );

    public static partial List<AdmisionDetalleResponse> ToResponse(
        IEnumerable<AdmisionDetalleEntity> entities
    );

    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.AdmisionId))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Admision))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Servicio))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Medico))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Total))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Activo))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.ModificadoPor))]
    public static partial AdmisionDetalleEntity ToEntity(
        CreateAdmisionDetalleRequest request
    );

    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Id))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.AdmisionId))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Admision))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Servicio))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Medico))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Total))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.Activo))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AdmisionDetalleEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateAdmisionDetalleRequest request,
        AdmisionDetalleEntity entity
    );
}
