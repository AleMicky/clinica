using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;
using Riok.Mapperly.Abstractions;
using AsignacionEmpleadoEntity =
    Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity.AsignacionEmpleado;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Mappers;

[Mapper]
public static partial class AsignacionEmpleadoMapper
{
    public static partial AsignacionEmpleadoResponse ToResponse(
        AsignacionEmpleadoEntity entity
    );

    public static partial List<AsignacionEmpleadoResponse> ToResponse(
        IEnumerable<AsignacionEmpleadoEntity> entities
    );

    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Id))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Activo))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Empleado))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Area))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Cargo))]
    public static partial AsignacionEmpleadoEntity ToEntity(
        CreateAsignacionEmpleadoRequest request
    );

    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Id))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Activo))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Empleado))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Area))]
    [MapperIgnoreTarget(nameof(AsignacionEmpleadoEntity.Cargo))]
    public static partial void UpdateEntity(
        UpdateAsignacionEmpleadoRequest request,
        AsignacionEmpleadoEntity entity
    );
}