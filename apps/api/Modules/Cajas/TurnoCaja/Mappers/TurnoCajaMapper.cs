using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Riok.Mapperly.Abstractions;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Mappers;

[Mapper]
public static partial class TurnoCajaMapper
{
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Caja))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Empleado))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Cobros))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Movimientos))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Arqueos))]
    public static partial TurnoCajaEntity ToEntity(
        CreateTurnoCajaRequest request
    );

    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Caja))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Empleado))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Cobros))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Movimientos))]
    [MapperIgnoreTarget(nameof(TurnoCajaEntity.Arqueos))]
    public static partial void UpdateEntity(
        UpdateTurnoCajaRequest request,
        TurnoCajaEntity entity
    );
}
