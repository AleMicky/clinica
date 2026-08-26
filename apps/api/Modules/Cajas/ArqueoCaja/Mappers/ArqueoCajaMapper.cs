using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Riok.Mapperly.Abstractions;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Mappers;

[Mapper]
public static partial class ArqueoCajaMapper
{
    [MapperIgnoreSource(nameof(RegistrarArqueoCajaRequest.Detalles))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(ArqueoCajaEntity.FechaHora))]
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
        RegistrarArqueoCajaRequest request
    );
}