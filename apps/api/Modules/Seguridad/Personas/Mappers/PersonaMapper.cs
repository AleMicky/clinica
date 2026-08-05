using Clinica.Api.Modules.Seguridad.Personas.Dtos;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Riok.Mapperly.Abstractions;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.Seguridad.Personas.Mappers;

[Mapper]
public static partial class PersonaMapper
{
    public static partial PersonaResponse ToResponse(
        PersonaEntity entity
    );

    public static partial List<PersonaResponse> ToResponse(
        IEnumerable<PersonaEntity> entities
    );

    [MapperIgnoreTarget(nameof(PersonaEntity.Id))]
    [MapperIgnoreTarget(nameof(PersonaEntity.Activo))]
    [MapperIgnoreTarget(nameof(PersonaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(PersonaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(PersonaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(PersonaEntity.ModificadoPor))]
    public static partial PersonaEntity ToEntity(
        CreatePersonaRequest request
    );

    [MapperIgnoreTarget(nameof(PersonaEntity.Id))]
    [MapperIgnoreTarget(nameof(PersonaEntity.Activo))]
    [MapperIgnoreTarget(nameof(PersonaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(PersonaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(PersonaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(PersonaEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdatePersonaRequest request,
        PersonaEntity entity
    );
}