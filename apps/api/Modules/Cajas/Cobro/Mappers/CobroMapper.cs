using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Riok.Mapperly.Abstractions;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;

namespace Clinica.Api.Modules.Cajas.Cobro.Mappers;

[Mapper]
public static partial class CobroMapper
{
    // =========================================================
    // GENERAR COBRO DESDE VENTA
    // =========================================================

    [MapperIgnoreSource(nameof(GenerarCobroDesdeVentaRequest.CajaId))]

    [MapperIgnoreTarget(nameof(CobroEntity.Id))]
    [MapperIgnoreTarget(nameof(CobroEntity.Numero))]

    [MapperIgnoreTarget(nameof(CobroEntity.TurnoCajaId))]
    [MapperIgnoreTarget(nameof(CobroEntity.TurnoCaja))]

    [MapperIgnoreTarget(nameof(CobroEntity.VentaPagador))]

    [MapperIgnoreTarget(nameof(CobroEntity.FechaHora))]
    [MapperIgnoreTarget(nameof(CobroEntity.Total))]
    [MapperIgnoreTarget(nameof(CobroEntity.Estado))]

    [MapperIgnoreTarget(nameof(CobroEntity.Observacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.Detalles))]

    [MapperIgnoreTarget(nameof(CobroEntity.MotivoAnulacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaHoraAnulacion))]

    [MapperIgnoreTarget(nameof(CobroEntity.Activo))]

    [MapperIgnoreTarget(nameof(CobroEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CobroEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CobroEntity.ModificadoPor))]
    public static partial CobroEntity ToEntity(
        GenerarCobroDesdeVentaRequest request
    );


 
    [MapperIgnoreSource(nameof(ConfirmarCobroRequest.Detalles))]

    [MapperIgnoreTarget(nameof(CobroEntity.Id))]
    [MapperIgnoreTarget(nameof(CobroEntity.Numero))]

    [MapperIgnoreTarget(nameof(CobroEntity.TurnoCajaId))]
    [MapperIgnoreTarget(nameof(CobroEntity.TurnoCaja))]

    [MapperIgnoreTarget(nameof(CobroEntity.VentaPagadorId))]
    [MapperIgnoreTarget(nameof(CobroEntity.VentaPagador))]

    [MapperIgnoreTarget(nameof(CobroEntity.FechaHora))]
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
        ConfirmarCobroRequest request,
        CobroEntity entity
    );
}