using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Riok.Mapperly.Abstractions;
using MovimientoCajaEntity =
    Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Mappers;

[Mapper]
public static partial class MovimientoCajaMapper
{
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaHora))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.MontoMonedaBase))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Moneda))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(MovimientoCajaEntity.ModificadoPor))]
    public static partial MovimientoCajaEntity ToEntity(
        RegistrarMovimientoCajaRequest request
    );
}