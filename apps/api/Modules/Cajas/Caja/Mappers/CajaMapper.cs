using Clinica.Api.Modules.Cajas.Caja.Dtos;
using Riok.Mapperly.Abstractions;
using CajaEntity = Clinica.Api.Modules.Cajas.Caja.Entity.Caja;

namespace Clinica.Api.Modules.Cajas.Caja.Mappers;

[Mapper]
public static partial class CajaMapper
{
    [MapperIgnoreSource(nameof(CajaEntity.Turnos))]
    public static partial CajaResponse ToResponse(
        CajaEntity entity
    );

    public static partial List<CajaResponse> ToResponse(
        IEnumerable<CajaEntity> entities
    );

    [MapperIgnoreTarget(nameof(CajaEntity.Id))]
    [MapperIgnoreTarget(nameof(CajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(CajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CajaEntity.Turnos))]
    public static partial CajaEntity ToEntity(
        CreateCajaRequest request
    );

    [MapperIgnoreTarget(nameof(CajaEntity.Id))]
    [MapperIgnoreTarget(nameof(CajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(CajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CajaEntity.Turnos))]
    public static partial void UpdateEntity(
        UpdateCajaRequest request,
        CajaEntity entity
    );
}
