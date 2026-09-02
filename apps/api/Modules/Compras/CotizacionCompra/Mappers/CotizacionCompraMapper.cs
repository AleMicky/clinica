using Clinica.Api.Modules.Compras.CotizacionCompra.Dtos;
using Riok.Mapperly.Abstractions;
using CotizacionCompraDetalleEntity = Clinica.Api.Modules.Compras.CotizacionCompra.Entity.CotizacionCompraDetalle;
using CotizacionCompraEntity = Clinica.Api.Modules.Compras.CotizacionCompra.Entity.CotizacionCompra;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Mappers;

[Mapper]
public static partial class CotizacionCompraMapper
{
    [MapperIgnoreSource(nameof(CotizacionCompraEntity.Detalles))]
    [MapperIgnoreSource(nameof(CotizacionCompraEntity.Proveedor))]
    [MapperIgnoreSource(nameof(CotizacionCompraEntity.SolicitudCompra))]
    public static partial CotizacionCompraResponse ToResponse(
        CotizacionCompraEntity entity);

    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Id))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Activo))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Detalles))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Proveedor))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.SolicitudCompra))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Numero))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Estado))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Subtotal))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Descuento))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Impuesto))]
    [MapperIgnoreTarget(nameof(CotizacionCompraEntity.Total))]
    public static partial CotizacionCompraEntity ToEntity(
        CreateCotizacionCompraRequest request);

    [MapperIgnoreSource(nameof(CotizacionCompraDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(CotizacionCompraDetalleEntity.CotizacionCompra))]
    public static partial CotizacionCompraDetalleResponse ToResponse(
        CotizacionCompraDetalleEntity entity);

    public static partial List<CotizacionCompraDetalleResponse> ToResponse(
        IEnumerable<CotizacionCompraDetalleEntity> entities);
}
