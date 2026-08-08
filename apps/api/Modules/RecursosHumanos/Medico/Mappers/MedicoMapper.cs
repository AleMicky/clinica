using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Riok.Mapperly.Abstractions;
using MedicoEntity = Clinica.Api.Modules.RecursosHumanos.Medico.Entity.Medico;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Mappers;

[Mapper]
public static partial class MedicoMapper
{
    [MapperIgnoreSource(nameof(MedicoEntity.Empleado))]
    public static partial MedicoResponse ToResponse(
        MedicoEntity entity
    );

    public static partial List<MedicoResponse> ToResponse(
        IEnumerable<MedicoEntity> entities
    );

    [MapperIgnoreTarget(nameof(MedicoEntity.Id))]
    [MapperIgnoreTarget(nameof(MedicoEntity.Empleado))]
    [MapperIgnoreTarget(nameof(MedicoEntity.EmpleadoId))]
    [MapperIgnoreTarget(nameof(MedicoEntity.Activo))]
    [MapperIgnoreTarget(nameof(MedicoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MedicoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MedicoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MedicoEntity.ModificadoPor))]
    public static partial MedicoEntity ToEntity(
        CreateMedicoRequest request
    );

    [MapperIgnoreTarget(nameof(MedicoEntity.Id))]
    [MapperIgnoreTarget(nameof(MedicoEntity.Empleado))]
    [MapperIgnoreTarget(nameof(MedicoEntity.EmpleadoId))]
    [MapperIgnoreTarget(nameof(MedicoEntity.Activo))]
    [MapperIgnoreTarget(nameof(MedicoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MedicoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MedicoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MedicoEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateMedicoRequest request,
        MedicoEntity entity
    );
}
