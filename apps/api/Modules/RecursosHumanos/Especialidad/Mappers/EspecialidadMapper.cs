using Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;
using Riok.Mapperly.Abstractions;
using EspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity.Especialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Mappers;

[Mapper]
public static partial class EspecialidadMapper
{
    public static partial EspecialidadResponse ToResponse(
        EspecialidadEntity entity
    );

    public static partial List<EspecialidadResponse> ToResponse(
        IEnumerable<EspecialidadEntity> entities
    );

    [MapperIgnoreTarget(nameof(EspecialidadEntity.Id))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.Activo))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.ModificadoPor))]
    public static partial EspecialidadEntity ToEntity(
        CreateEspecialidadRequest request
    );

    [MapperIgnoreTarget(nameof(EspecialidadEntity.Id))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.Activo))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(EspecialidadEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateEspecialidadRequest request,
        EspecialidadEntity entity
    );
}
