using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Riok.Mapperly.Abstractions;
using MovimientoCajaEntity = Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Mappers;

[Mapper]
public static partial class MovimientoCajaMapper
{
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.TurnoCaja))]
    public static partial MovimientoCajaEntity ToEntity(
        CreateMovimientoCajaRequest request
    );

    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.TurnoCaja))]
    public static partial void UpdateEntity(
        UpdateMovimientoCajaRequest request,
        MovimientoCajaEntity entity
    );
}