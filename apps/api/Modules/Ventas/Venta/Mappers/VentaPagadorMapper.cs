using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Riok.Mapperly.Abstractions;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Ventas.Venta.Mappers;

[Mapper]
public static partial class VentaPagadorMapper
{
    [MapperIgnoreSource(nameof(VentaPagadorEntity.Venta))]
    [MapperIgnoreSource(nameof(VentaPagadorEntity.Convenio))]
    public static partial VentaPagadorResponse ToResponse(
        VentaPagadorEntity entity
    );

    public static partial List<VentaPagadorResponse> ToResponse(
        IEnumerable<VentaPagadorEntity> entities
    );

    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.VentaId))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Venta))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Convenio))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Estado))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.ModificadoPor))]
    public static partial VentaPagadorEntity ToEntity(
        CreateVentaPagadorRequest request
    );

    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Id))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.VentaId))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Venta))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Convenio))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Estado))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.Activo))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(VentaPagadorEntity.ModificadoPor))]
    public static partial void UpdateEntity(
        UpdateVentaPagadorRequest request,
        VentaPagadorEntity entity
    );
}