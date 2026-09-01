using Clinica.Api.Modules.Almacenes.InventarioFisico.Dtos;
using Riok.Mapperly.Abstractions;
using InventarioFisicoDetalleEntity = Clinica.Api.Modules.Almacenes.InventarioFisico.Entity.InventarioFisicoDetalle;
using InventarioFisicoEntity = Clinica.Api.Modules.Almacenes.InventarioFisico.Entity.InventarioFisico;

namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Mappers;

[Mapper]
public static partial class InventarioFisicoMapper
{
    [MapperIgnoreSource(nameof(InventarioFisicoEntity.Detalles))]
    [MapperIgnoreSource(nameof(InventarioFisicoEntity.Almacen))]
    public static partial InventarioFisicoResponse ToResponse(
        InventarioFisicoEntity entity);

    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.Id))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.Activo))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.Detalles))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.Almacen))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.Estado))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.FechaCierre))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.MovimientoAjustePositivoId))]
    [MapperIgnoreTarget(nameof(InventarioFisicoEntity.MovimientoAjusteNegativoId))]
    public static partial InventarioFisicoEntity ToEntity(
        CreateInventarioFisicoRequest request);

    [MapperIgnoreSource(nameof(InventarioFisicoDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(InventarioFisicoDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(InventarioFisicoDetalleEntity.InventarioFisico))]
    public static partial InventarioFisicoDetalleResponse ToResponse(
        InventarioFisicoDetalleEntity entity);

    public static partial List<InventarioFisicoDetalleResponse> ToResponse(
        IEnumerable<InventarioFisicoDetalleEntity> entities);
}