using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Riok.Mapperly.Abstractions;
using MedicoServicioAcuerdoEntity =
    Clinica.Api.Modules.RecursosHumanos.Medico.Entity.MedicoServicioAcuerdo;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Mappers;

[Mapper]
public static partial class MedicoServicioAcuerdoMapper
{
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Id))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Medico))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.MedicoId))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Servicio))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Activo))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.ModificadoPor))]
    public static partial MedicoServicioAcuerdoEntity ToEntity(
        CreateMedicoServicioAcuerdoRequest request
    );

    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Id))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Medico))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.MedicoId))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Servicio))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.Activo))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MedicoServicioAcuerdoEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateMedicoServicioAcuerdoRequest request,
        MedicoServicioAcuerdoEntity entity
    );
}
