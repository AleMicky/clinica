using Clinica.Api.Modules.Almacenes.ConsumoInterno.Dtos;
using Riok.Mapperly.Abstractions;
using ConsumoInternoDetalleEntity = Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity.ConsumoInternoDetalle;
using ConsumoInternoEntity = Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity.ConsumoInterno;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Mappers;

[Mapper]
public static partial class ConsumoInternoMapper
{
    [MapperIgnoreSource(nameof(ConsumoInternoEntity.Detalles))]
    [MapperIgnoreSource(nameof(ConsumoInternoEntity.Almacen))]
    [MapperIgnoreSource(nameof(ConsumoInternoEntity.MovimientoInventario))]
    public static partial ConsumoInternoResponse ToResponse(ConsumoInternoEntity entity);

    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.Id))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.Activo))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.FechaCreacion))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.FechaModificacion))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.CreadoPor))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.ModificadoPor))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.Detalles))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.Almacen))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.MovimientoInventario))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.Estado))]
    [MapperIgnoreTarget(nameof(ConsumoInternoEntity.MovimientoInventarioId))]
    public static partial ConsumoInternoEntity ToEntity(CreateConsumoInternoRequest request);

    [MapperIgnoreSource(nameof(ConsumoInternoDetalleEntity.Producto))]
    [MapperIgnoreSource(nameof(ConsumoInternoDetalleEntity.Lote))]
    [MapperIgnoreSource(nameof(ConsumoInternoDetalleEntity.ConsumoInterno))]
    public static partial ConsumoInternoDetalleResponse ToResponse(ConsumoInternoDetalleEntity entity);

    public static partial List<ConsumoInternoDetalleResponse> ToResponse(IEnumerable<ConsumoInternoDetalleEntity> entities);
    
}