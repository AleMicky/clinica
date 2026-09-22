using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Riok.Mapperly.Abstractions;
using EmpleadoEntity =
    Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Mappers;

[Mapper]
public static partial class EmpleadoPersonaMapper
{
    // =========================================================
    // CREATE EMPLEADO + PERSONA
    // =========================================================

    [MapperIgnoreTarget(nameof(EmpleadoEntity.Id))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.PersonaId))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CodigoEmpleado))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Activo))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Asignaciones))]
    public static partial EmpleadoEntity ToEntity(
        EmpleadoPersonaRequest request);

    // =========================================================
    // UPDATE EMPLEADO
    // =========================================================

    [MapperIgnoreTarget(nameof(EmpleadoEntity.Id))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.PersonaId))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CodigoEmpleado))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Activo))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Persona))]
    [MapperIgnoreTarget(nameof(EmpleadoEntity.Asignaciones))]
    public static partial void UpdateEntity(
        EmpleadoPersonaRequest request,
        EmpleadoEntity entity);

    // =========================================================
    // CREATE PERSONA
    // =========================================================

    [MapperIgnoreTarget(nameof(Persona.Id))]
    [MapperIgnoreTarget(nameof(Persona.Activo))]
    [MapperIgnoreTarget(nameof(Persona.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Persona.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Persona.CreadoPor))]
    [MapperIgnoreTarget(nameof(Persona.ModificadoPor))]
    private static partial Persona ToPersona(
        PersonaCreateDto request);

    // =========================================================
    // UPDATE PERSONA
    // =========================================================

    [MapperIgnoreTarget(nameof(Persona.Id))]
    [MapperIgnoreTarget(nameof(Persona.Activo))]
    [MapperIgnoreTarget(nameof(Persona.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Persona.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Persona.CreadoPor))]
    [MapperIgnoreTarget(nameof(Persona.ModificadoPor))]
    public static partial void UpdatePersona(
        PersonaCreateDto request,
        Persona entity);
}