using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Riok.Mapperly.Abstractions;
using MedicoEspecialidadEntity =
    Clinica.Api.Modules.RecursosHumanos.Medico.Entity.MedicoEspecialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Mappers;

[Mapper]
public static partial class MedicoEspecialidadMapper
{
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Id))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Medico))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.MedicoId))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Especialidad))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Activo))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.ModificadoPor))]
    public static partial MedicoEspecialidadEntity ToEntity(
        CreateMedicoEspecialidadRequest request
    );

    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Id))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Medico))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.MedicoId))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Especialidad))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.Activo))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MedicoEspecialidadEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateMedicoEspecialidadRequest request,
        MedicoEspecialidadEntity entity
    );
}
