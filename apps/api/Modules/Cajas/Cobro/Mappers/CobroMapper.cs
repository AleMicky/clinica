using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Riok.Mapperly.Abstractions;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;

namespace Clinica.Api.Modules.Cajas.Cobro.Mappers;

[Mapper]
public static partial class CobroMapper
{
    [MapperIgnoreSource(nameof(CobroRequest.Detalles))]
    [MapperIgnoreTarget(nameof(CobroEntity.Id))]
    [MapperIgnoreTarget(nameof(CobroEntity.Numero))]
    [MapperIgnoreTarget(nameof(CobroEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(CobroEntity.VentaPagador))]
    [MapperIgnoreTarget(nameof(CobroEntity.Total))]
    [MapperIgnoreTarget(nameof(CobroEntity.Estado))]
    [MapperIgnoreTarget(nameof(CobroEntity.Detalles))]
    [MapperIgnoreTarget(nameof(CobroEntity.MotivoAnulacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaHoraAnulacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.Activo))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CobroEntity.ModificadoPor))]
    public static partial CobroEntity ToEntity(
        CreateCobroRequest request
    );

    [MapperIgnoreSource(nameof(CobroRequest.Detalles))]
    [MapperIgnoreTarget(nameof(CobroEntity.Id))]
    [MapperIgnoreTarget(nameof(CobroEntity.Numero))]
    [MapperIgnoreTarget(nameof(CobroEntity.TurnoCaja))]
    [MapperIgnoreTarget(nameof(CobroEntity.VentaPagador))]
    [MapperIgnoreTarget(nameof(CobroEntity.Total))]
    [MapperIgnoreTarget(nameof(CobroEntity.Estado))]
    [MapperIgnoreTarget(nameof(CobroEntity.Detalles))]
    [MapperIgnoreTarget(nameof(CobroEntity.MotivoAnulacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaHoraAnulacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.Activo))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CobroEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateCobroRequest request,
        CobroEntity entity
    );
}