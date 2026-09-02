using Clinica.Api.Modules.Compras.OrdenCompra.Dtos;
using Riok.Mapperly.Abstractions;
using OrdenCompraDetalleEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompraDetalle;
using OrdenCompraEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompra;

namespace Clinica.Api.Modules.Compras.OrdenCompra.Mappers;

[Mapper]
public static partial class OrdenCompraMapper
{
    [MapperIgnoreSource(nameof(OrdenCompraEntity.Detalles))]
    [MapperIgnoreSource(nameof(OrdenCompraEntity.Proveedor))]
    [MapperIgnoreSource(nameof(OrdenCompraEntity.Almacen))]
    [MapperIgnoreSource(nameof(OrdenCompraEntity.SolicitudCompra))]
    [MapperIgnoreSource(nameof(OrdenCompraEntity.CotizacionCompra))]
    public static partial OrdenCompraResponse ToResponse(
        OrdenCompraEntity entity);

    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Id))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Activo))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Detalles))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Proveedor))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Almacen))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.SolicitudCompra))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.CotizacionCompra))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Numero))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Estado))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Subtotal))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Descuento))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Impuesto))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.Total))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.AprobadoPorId))]
    [MapperIgnoreTarget(nameof(OrdenCompraEntity.FechaAprobacion))]
    public static partial OrdenCompraEntity ToEntity(
        CreateOrdenCompraRequest request);

    [MapperIgnoreSource(nameof(OrdenCompraDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(OrdenCompraDetalleEntity.OrdenCompra))]
    public static partial OrdenCompraDetalleResponse ToResponse(
        OrdenCompraDetalleEntity entity);

    public static partial List<OrdenCompraDetalleResponse> ToResponse(
        IEnumerable<OrdenCompraDetalleEntity> entities);
}
