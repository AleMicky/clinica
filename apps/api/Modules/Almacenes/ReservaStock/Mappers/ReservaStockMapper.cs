using Clinica.Api.Modules.Almacenes.ReservaStock.Dtos;
using Riok.Mapperly.Abstractions;
using ReservaStockDetalleEntity = Clinica.Api.Modules.Almacenes.ReservaStock.Entity.ReservaStockDetalle;
using ReservaStockEntity = Clinica.Api.Modules.Almacenes.ReservaStock.Entity.ReservaStock;

namespace Clinica.Api.Modules.Almacenes.ReservaStock.Mappers;

[Mapper]
public static partial class ReservaStockMapper
{
    [MapperIgnoreSource(nameof(ReservaStockEntity.Detalles))]
    [MapperIgnoreSource(nameof(ReservaStockEntity.Almacen))]
    public static partial ReservaStockResponse ToResponse(
        ReservaStockEntity entity);

    [MapperIgnoreTarget(nameof(ReservaStockEntity.Id))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.Activo))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.Detalles))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.Almacen))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.Estado))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.FechaLiberacion))]
    [MapperIgnoreTarget(nameof(ReservaStockEntity.FechaConsumo))]
    public static partial ReservaStockEntity ToEntity(
        CreateReservaStockRequest request);

    [MapperIgnoreSource(nameof(ReservaStockDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(ReservaStockDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(ReservaStockDetalleEntity.ReservaStock))]
    public static partial ReservaStockDetalleResponse ToResponse(
        ReservaStockDetalleEntity entity);

    public static partial List<ReservaStockDetalleResponse> ToResponse(
        IEnumerable<ReservaStockDetalleEntity> entities);
}
