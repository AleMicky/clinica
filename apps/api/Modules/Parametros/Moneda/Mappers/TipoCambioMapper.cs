using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.Moneda.Mappers;

[Mapper]
public static partial class TipoCambioMapper
{
    [MapperIgnoreSource(nameof(TipoCambio.MonedaOrigen))]
    [MapperIgnoreSource(nameof(TipoCambio.MonedaDestino))]
    public static partial TipoCambioResponse ToResponse(
        TipoCambio entity
    );

    [MapperIgnoreSource(nameof(TipoCambio.MonedaOrigen))]
    [MapperIgnoreSource(nameof(TipoCambio.MonedaDestino))]
    public static partial List<TipoCambioResponse> ToResponse(
        IEnumerable<TipoCambio> entities
    );

    [MapperIgnoreTarget(nameof(TipoCambio.Id))]
    [MapperIgnoreTarget(nameof(TipoCambio.MonedaOrigen))]
    [MapperIgnoreTarget(nameof(TipoCambio.MonedaDestino))]
    [MapperIgnoreTarget(nameof(TipoCambio.Activo))]
    [MapperIgnoreTarget(nameof(TipoCambio.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TipoCambio.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TipoCambio.CreadoPor))]
    [MapperIgnoreTarget(nameof(TipoCambio.ModificadoPor))]
    public static partial TipoCambio ToEntity(
        CreateTipoCambioRequest request
    );

    [MapperIgnoreTarget(nameof(TipoCambio.Id))]
    [MapperIgnoreTarget(nameof(TipoCambio.MonedaOrigen))]
    [MapperIgnoreTarget(nameof(TipoCambio.MonedaDestino))]
    [MapperIgnoreTarget(nameof(TipoCambio.Activo))]
    [MapperIgnoreTarget(nameof(TipoCambio.FechaCreacion))]
    [MapperIgnoreTarget(nameof(TipoCambio.FechaModificacion))]
    [MapperIgnoreTarget(nameof(TipoCambio.CreadoPor))]
    [MapperIgnoreTarget(nameof(TipoCambio.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateTipoCambioRequest request,
        TipoCambio entity
    );
}