using Clinica.Api.Modules.Cajas.DevolucionCobro.Dtos;
using Riok.Mapperly.Abstractions;
using DevolucionCobroEntity = Clinica.Api.Modules.Cajas.DevolucionCobro.Entity.DevolucionCobro;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Mappers;

[Mapper]
public static partial class DevolucionCobroMapper
{
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Id))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Numero))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Cobro))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.MetodoPago))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Moneda))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Activo))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.ModificadoPor))]
    public static partial DevolucionCobroEntity ToEntity(
        CreateDevolucionCobroRequest request
    );

    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Id))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Numero))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Cobro))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.MetodoPago))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Moneda))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.Activo))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(DevolucionCobroEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateDevolucionCobroRequest request,
        DevolucionCobroEntity entity
    );
}