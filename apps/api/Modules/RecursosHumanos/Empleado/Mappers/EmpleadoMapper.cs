using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Riok.Mapperly.Abstractions;
using EmpleadoEntity =
    Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Mappers;

[Mapper]
public static partial class EmpleadoMapper
{
    [MapperIgnoreSource(nameof(EmpleadoEntity.Persona))]
    [MapperIgnoreSource(nameof(EmpleadoEntity.Asignaciones))]
    [MapperIgnoreTarget(nameof(EmpleadoResponse.Persona))]
    public static partial EmpleadoResponse ToResponse(
        EmpleadoEntity entity);

    [MapperIgnoreTarget(nameof(EmpleadoEntity.Id))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CodigoEmpleado))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Activo))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Persona))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Asignaciones))]
    public static partial EmpleadoEntity ToEntity(
        CreateEmpleadoRequest request);

    [MapperIgnoreTarget(nameof(EmpleadoEntity.Id))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CodigoEmpleado))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Activo))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Persona))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Asignaciones))]
    public static partial void UpdateEntity(
        UpdateEmpleadoRequest request,
        EmpleadoEntity entity);
}