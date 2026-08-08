using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Riok.Mapperly.Abstractions;
using PacienteConvenioEntity = Clinica.Api.Modules.Recepcion.Pacientes.Entity.PacienteConvenio;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Mappers;

[Mapper]
public static partial class PacienteConvenioMapper
{
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Id))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Paciente))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.PacienteId))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Convenio))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Activo))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.ModificadoPor))]
    public static partial PacienteConvenioEntity ToEntity(
        CreatePacienteConvenioRequest request
    );

    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Id))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Paciente))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.PacienteId))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Convenio))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.Activo))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(PacienteConvenioEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdatePacienteConvenioRequest request,
        PacienteConvenioEntity entity
    );
}
