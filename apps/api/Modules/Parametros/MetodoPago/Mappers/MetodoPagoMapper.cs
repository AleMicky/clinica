using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Parametros.MetodoPago.Mappers;

[Mapper]
public static partial class MetodoPagoMapper
{
    public static partial MetodoPagoResponse ToResponse(
        Entity.MetodoPago entity
    );

    public static partial List<MetodoPagoResponse> ToResponse(
        IEnumerable<Entity.MetodoPago> entities
    );

    [MapperIgnoreTarget(nameof(Entity.MetodoPago.Id))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.Activo))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.ModificadoPor))]
    public static partial Entity.MetodoPago ToEntity(
        CreateMetodoPagoRequest request
    );

    [MapperIgnoreTarget(nameof(Entity.MetodoPago.Id))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.Activo))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.CreadoPor))]
    [MapperIgnoreTarget(nameof(Entity.MetodoPago.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateMetodoPagoRequest request,
        Entity.MetodoPago entity
    );
}
