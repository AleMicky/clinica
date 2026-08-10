using Clinica.Api.Modules.RecursosHumanos.Cargo.Dtos;
using Riok.Mapperly.Abstractions;
using CargoEntity = Clinica.Api.Modules.RecursosHumanos.Cargo.Entity.Cargo;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Mappers;

[Mapper]
public static partial class CargoMapper
{
    [MapperIgnoreSource(nameof(CargoEntity.Asignaciones))]
    public static partial CargoResponse ToResponse(
        CargoEntity entity
    );

    public static partial List<CargoResponse> ToResponse(
        IEnumerable<CargoEntity> entities
    );

    [MapperIgnoreTarget(nameof(CargoEntity.Id))]
    [MapperIgnoreTarget(nameof(CargoEntity.Activo))]
    [MapperIgnoreTarget(nameof(CargoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CargoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CargoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CargoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CargoEntity.Asignaciones))]
    public static partial CargoEntity ToEntity(
        CreateCargoRequest request
    );

    [MapperIgnoreTarget(nameof(CargoEntity.Id))]
    [MapperIgnoreTarget(nameof(CargoEntity.Activo))]
    [MapperIgnoreTarget(nameof(CargoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CargoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CargoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CargoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CargoEntity.Asignaciones))]
    public static partial void UpdateEntity(
        UpdateCargoRequest request,
        CargoEntity entity
    );
}