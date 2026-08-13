using Clinica.Api.Modules.Cajas.AperturaCaja.Dtos;
using Riok.Mapperly.Abstractions;
using AperturaCajaEntity = Clinica.Api.Modules.Cajas.AperturaCaja.Entity.AperturaCaja;

namespace Clinica.Api.Modules.Cajas.AperturaCaja.Mappers;

[Mapper]
public static partial class AperturaCajaMapper
{
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.TurnoCaja))]
    public static partial AperturaCajaEntity ToEntity(
        CreateAperturaCajaRequest request
    );

    [MapperIgnoreTarget(nameof(AperturaCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(AperturaCajaEntity.TurnoCaja))]
    public static partial void UpdateEntity(
        UpdateAperturaCajaRequest request,
        AperturaCajaEntity entity
    );
}