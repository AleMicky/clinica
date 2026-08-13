using Clinica.Api.Modules.Cajas.CierreCaja.Dtos;
using Riok.Mapperly.Abstractions;
using CierreCajaEntity = Clinica.Api.Modules.Cajas.CierreCaja.Entity.CierreCaja;

namespace Clinica.Api.Modules.Cajas.CierreCaja.Mappers;

[Mapper]
public static partial class CierreCajaMapper
{
    [MapperIgnoreTarget(nameof(CierreCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.ArqueoCaja))]
    public static partial CierreCajaEntity ToEntity(
        CreateCierreCajaRequest request
    );

    [MapperIgnoreTarget(nameof(CierreCajaEntity.Id))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.Activo))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(CierreCajaEntity.ArqueoCaja))]
    public static partial void UpdateEntity(
        UpdateCierreCajaRequest request,
        CierreCajaEntity entity
    );
}