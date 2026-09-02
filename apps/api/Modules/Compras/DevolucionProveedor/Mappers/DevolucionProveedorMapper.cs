using Clinica.Api.Modules.Compras.DevolucionProveedor.Dtos;
using Riok.Mapperly.Abstractions;
using DevolucionProveedorDetalleEntity = Clinica.Api.Modules.Compras.DevolucionProveedor.Entity.DevolucionProveedorDetalle;
using DevolucionProveedorEntity = Clinica.Api.Modules.Compras.DevolucionProveedor.Entity.DevolucionProveedor;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Mappers;

[Mapper]
public static partial class DevolucionProveedorMapper
{
    [MapperIgnoreSource(nameof(DevolucionProveedorEntity.Detalles))]
    [MapperIgnoreSource(nameof(DevolucionProveedorEntity.Proveedor))]
    [MapperIgnoreSource(nameof(DevolucionProveedorEntity.Almacen))]
    [MapperIgnoreSource(nameof(DevolucionProveedorEntity.RecepcionCompra))]
    [MapperIgnoreSource(nameof(DevolucionProveedorEntity.MovimientoInventario))]
    public static partial DevolucionProveedorResponse ToResponse(
        DevolucionProveedorEntity entity);

    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Id))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Activo))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Numero))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Estado))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.AutorizadoPorId))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.FechaAutorizacion))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.MovimientoInventarioId))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Detalles))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Proveedor))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.Almacen))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.RecepcionCompra))]
    [MapperIgnoreTarget(nameof(DevolucionProveedorEntity.MovimientoInventario))]
    public static partial DevolucionProveedorEntity ToEntity(
        CreateDevolucionProveedorRequest request);

    [MapperIgnoreSource(nameof(DevolucionProveedorDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(DevolucionProveedorDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(DevolucionProveedorDetalleEntity.DevolucionProveedor))]
    public static partial DevolucionProveedorDetalleResponse ToResponse(
        DevolucionProveedorDetalleEntity entity);
}