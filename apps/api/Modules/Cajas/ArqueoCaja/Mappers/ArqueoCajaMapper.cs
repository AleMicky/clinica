using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Riok.Mapperly.Abstractions;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Mappers;

[Mapper]
public static partial class ArqueoCajaMapper
{
    [MapperIgnoreSource(nameof(ArqueoCajaRequest.Detalles))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TotalEsperado))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TotalContado))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Diferencia))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Detalles))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.ModificadoPor))]
    public static partial ArqueoCajaEntity ToEntity(
        CreateArqueoCajaRequest request
    );

    [MapperIgnoreSource(nameof(ArqueoCajaRequest.Detalles))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TotalEsperado))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TotalContado))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Diferencia))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Detalles))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateArqueoCajaRequest request,
        ArqueoCajaEntity entity
    );
}