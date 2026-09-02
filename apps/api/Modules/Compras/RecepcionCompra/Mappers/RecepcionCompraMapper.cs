using Clinica.Api.Modules.Compras.RecepcionCompra.Dtos;
using Riok.Mapperly.Abstractions;
using RecepcionCompraDetalleEntity = Clinica.Api.Modules.Compras.RecepcionCompra.Entity.RecepcionCompraDetalle;
using RecepcionCompraEntity = Clinica.Api.Modules.Compras.RecepcionCompra.Entity.RecepcionCompra;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Mappers;

[Mapper]
public static partial class RecepcionCompraMapper
{
    [MapperIgnoreSource(nameof(RecepcionCompraEntity.Detalles))]
    [MapperIgnoreSource(nameof(RecepcionCompraEntity.OrdenCompra))]
    [MapperIgnoreSource(nameof(RecepcionCompraEntity.Proveedor))]
    [MapperIgnoreSource(nameof(RecepcionCompraEntity.Almacen))]
    [MapperIgnoreSource(nameof(RecepcionCompraEntity.MovimientoInventario))]
    public static partial RecepcionCompraResponse ToResponse(
        RecepcionCompraEntity entity);

    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Id))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Activo))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Detalles))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.OrdenCompra))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Proveedor))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Almacen))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.MovimientoInventario))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Numero))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.Estado))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.RecibidoPorId))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.MovimientoInventarioId))]
    [MapperIgnoreTarget(nameof(RecepcionCompraEntity.ProveedorId))]
    public static partial RecepcionCompraEntity ToEntity(
        CreateRecepcionCompraRequest request);

    [MapperIgnoreSource(nameof(RecepcionCompraDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(RecepcionCompraDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(RecepcionCompraDetalleEntity.OrdenCompraDetalle))]
    [MapperIgnoreSource(nameof(RecepcionCompraDetalleEntity.RecepcionCompra))]
    public static partial RecepcionCompraDetalleResponse ToResponse(
        RecepcionCompraDetalleEntity entity);

    public static partial List<RecepcionCompraDetalleResponse> ToResponse(
        IEnumerable<RecepcionCompraDetalleEntity> entities);
}
