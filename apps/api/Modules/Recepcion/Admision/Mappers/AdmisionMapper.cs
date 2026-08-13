using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Riok.Mapperly.Abstractions;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;
using PacienteEntity = Clinica.Api.Modules.Recepcion.Pacientes.Entity.Paciente;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;
using ConvenioEntity = Clinica.Api.Modules.Servicios.Convenios.Entity.Convenio;


namespace Clinica.Api.Modules.Recepcion.Admision.Mappers;

[Mapper]
public static partial class AdmisionMapper
{
    [MapperIgnoreSource(nameof(AdmisionEntity.PacienteId))]
    [MapperIgnoreSource(nameof(AdmisionEntity.ConvenioId))]
    [MapperIgnoreSource(nameof(AdmisionEntity.Detalles))]
    public static partial AdmisionResponse ToResponse(
        AdmisionEntity entity
    );

    [MapperIgnoreSource(nameof(PacienteEntity.PersonaId))]
    [MapperIgnoreSource(nameof(PacienteEntity.Activo))]
    [MapperIgnoreSource(nameof(PacienteEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(PacienteEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(PacienteEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(PacienteEntity.ModificadoPor))]
    private static partial PacienteInfo ToPacienteInfo(
        PacienteEntity entity
    );

    [MapperIgnoreSource(nameof(PersonaEntity.FechaNacimiento))]
    [MapperIgnoreSource(nameof(PersonaEntity.Telefono))]
    [MapperIgnoreSource(nameof(PersonaEntity.Direccion))]
    [MapperIgnoreSource(nameof(PersonaEntity.Genero))]
    [MapperIgnoreSource(nameof(PersonaEntity.EstadoCivil))]
    [MapperIgnoreSource(nameof(PersonaEntity.Activo))]
    [MapperIgnoreSource(nameof(PersonaEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(PersonaEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(PersonaEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(PersonaEntity.ModificadoPor))]
    private static partial PersonaInfoAdmision ToPersonaInfo(
        PersonaEntity entity
    );

    [MapperIgnoreSource(nameof(ConvenioEntity.Descripcion))]
    [MapperIgnoreSource(nameof(ConvenioEntity.FechaInicio))]
    [MapperIgnoreSource(nameof(ConvenioEntity.FechaFin))]
    [MapperIgnoreSource(nameof(ConvenioEntity.Tarifarios))]
    [MapperIgnoreSource(nameof(ConvenioEntity.Activo))]
    [MapperIgnoreSource(nameof(ConvenioEntity.FechaCreacion))]
    [MapperIgnoreSource(nameof(ConvenioEntity.FechaModificacion))]
    [MapperIgnoreSource(nameof(ConvenioEntity.CreadoPor))]
    [MapperIgnoreSource(nameof(ConvenioEntity.ModificadoPor))]
    private static partial ConvenioInfo ToConvenioInfo(
        ConvenioEntity entity
    );

    [MapperIgnoreSource(nameof(CreateAdmisionRequest.Detalles))]
    [MapperIgnoreTarget(nameof(AdmisionEntity.Numero))]
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
    [MapperIgnoreTarget(nameof(AdmisionEntity.Numero))]
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