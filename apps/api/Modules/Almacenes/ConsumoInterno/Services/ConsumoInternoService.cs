using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Dtos;
using Clinica.Api.Modules.Almacenes.ConsumoInterno.Enums;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;
using ConsumoDetalleEntity = Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity.ConsumoInternoDetalle;
using ConsumoEntity = Clinica.Api.Modules.Almacenes.ConsumoInterno.Entity.ConsumoInterno;
using ConsumoMapper = Clinica.Api.Modules.Almacenes.ConsumoInterno.Mappers.ConsumoInternoMapper;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.ConsumoInterno.Services;

public interface IConsumoInternoService
{
    Task<PagedResult<ConsumoInternoResponse>> ListarAsync(
        int? almacenId,
        int? areaId,
        EstadoConsumoInterno? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<ConsumoInternoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ConsumoInternoResponse> CrearAsync(
        CreateConsumoInternoRequest request,
        CancellationToken cancellationToken = default);

    Task<ConsumoInternoResponse> ActualizarAsync(
        int id,
        UpdateConsumoInternoRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ConsumoInternoResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ConsumoInternoResponse> AnularAsync(
        int id,
        AnularConsumoInternoRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class ConsumoInternoService(
    AppDbContext dbContext,
    IMovimientoInventarioService movimientoInventarioService)
    : IConsumoInternoService
{
    public async Task<PagedResult<ConsumoInternoResponse>> ListarAsync(
        int? almacenId,
        int? areaId,
        EstadoConsumoInterno? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .ConsumosInterno
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
        }

        if (areaId.HasValue)
        {
            query = query.Where(x => x.AreaId == areaId.Value);
        }

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Numero.Contains(termino) ||
                (x.ReferenciaTipo != null && x.ReferenciaTipo.Contains(termino)) ||
                (x.Observacion != null && x.Observacion.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var consumos = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .Include(x => x.Area)
            .ToListAsync(cancellationToken);

        var items = consumos
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                x.Area?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<ConsumoInternoResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<ConsumoInternoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var consumo = await dbContext
            .ConsumosInterno
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Area)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (consumo is null || !consumo.Activo)
        {
            throw new NotFoundException(nameof(ConsumoEntity), id);
        }

        return Mapear(
            consumo,
            consumo.Almacen?.Nombre,
            consumo.Area?.Nombre,
            consumo.Detalles);
    }

    public async Task<ConsumoInternoResponse> CrearAsync(CreateConsumoInternoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("El consumo interno debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.AreaId,
            request.Numero,
            idExcluido: null,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = ConsumoMapper.ToEntity(request);
        entity.Numero = NormalizarNumero(request.Numero);
        entity.ReferenciaTipo = Limpiar(request.ReferenciaTipo);
        entity.Observacion = Limpiar(request.Observacion);

        dbContext.ConsumosInterno.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<ConsumoInternoResponse> ActualizarAsync(
        int id,
        UpdateConsumoInternoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("El consumo interno debe tener al menos un detalle.");
        }

        var entity = await dbContext.ConsumosInterno
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ConsumoEntity), id);
        }

        if (entity.Estado != EstadoConsumoInterno.Borrador)
        {
            throw new ConflictException("No se puede editar un consumo que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.AreaId,
            request.Numero,
            idExcluido: id,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.AlmacenId = request.AlmacenId;
        entity.AreaId = request.AreaId;
        entity.Fecha = request.Fecha;
        entity.ReferenciaTipo = Limpiar(request.ReferenciaTipo);
        entity.ReferenciaId = request.ReferenciaId;
        entity.Observacion = Limpiar(request.Observacion);
        entity.Numero = NormalizarNumero(request.Numero);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ConsumosInterno
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ConsumoEntity), id);
        }

        if (entity.Estado != EstadoConsumoInterno.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar un consumo que no esté en estado Borrador. Anúlalo en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<ConsumoInternoResponse> ConfirmarAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ConsumosInterno
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ConsumoEntity), id);
        }

        switch (entity.Estado)
        {
            case EstadoConsumoInterno.Confirmado:
                throw new ConflictException("El consumo interno ya está confirmado.");
            case EstadoConsumoInterno.Anulado:
                throw new ConflictException("No se puede confirmar un consumo anulado.");
            case EstadoConsumoInterno.Borrador:
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }

        var detallesActivos = entity.Detalles.Where(x => x.Activo).ToList();
       
        if (detallesActivos.Count == 0)
        {
            throw new BusinessException("El consumo interno no tiene detalles activos.");
        }

        var detallesMovimiento = detallesActivos.Select(d => new MovimientoInventarioDetalleRequest
        {
            ProductoId = d.ProductoId,
            LoteId = d.LoteId,
            Cantidad = d.Cantidad,
        }).ToList();

        // 2. Construir el request de integración
        var requestIntegracion = new MovimientoInventarioIntegracionRequest
        {
            TipoMovimiento = "CONSUMO",
            AlmacenId = entity.AlmacenId,
            Fecha = DateTime.UtcNow,
            TipoReferencia = "CONSUMO_INTERNO",
            ReferenciaId = entity.Id,
            Observacion = $"Consumo interno {entity.Numero}",
            Detalles = detallesMovimiento
        };

        
        await movimientoInventarioService.CrearIntegracionAsync(requestIntegracion, cancellationToken);
        
        entity.Estado = EstadoConsumoInterno.Confirmado;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<ConsumoInternoResponse> AnularAsync(
        int id,
        AnularConsumoInternoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ConsumosInterno
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ConsumoEntity), id);
        }

        if (entity.Estado == EstadoConsumoInterno.Anulado)
        {
            throw new ConflictException("El consumo interno ya está anulado.");
        }

        if (entity.Estado == EstadoConsumoInterno.Borrador)
        {
            throw new ConflictException(
                "Un consumo en estado Borrador debe eliminarse en lugar de anularse.");
        }

        entity.Estado = EstadoConsumoInterno.Anulado;
        entity.Observacion = Limpiar(request.MotivoAnulacion);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarEncabezadoAsync(
        int almacenId,
        int areaId,
        string numero,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var existeAlmacen = await dbContext.Almacenes
            .AnyAsync(
                x => x.Id == almacenId && x.Activo,
                cancellationToken);

        if (!existeAlmacen)
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenId);
        }

        var existeArea = await dbContext.Areas
            .AnyAsync(
                x => x.Id == areaId && x.Activo,
                cancellationToken);

        if (!existeArea)
        {
            throw new NotFoundException(nameof(AreaEntity), areaId);
        }

        var numeroNormalizado = NormalizarNumero(numero);

        var existeNumero = await dbContext.ConsumosInterno
            .AnyAsync(
                x => x.Numero == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existeNumero)
        {
            throw new ConflictException(
                $"Ya existe un consumo interno con el número '{numeroNormalizado}'.");
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<ConsumoInternoDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var productoIds = detalles.Select(x => x.ProductoId).Distinct().ToList();
        var loteIds = detalles
            .Where(x => x.LoteId.HasValue)
            .Select(x => x.LoteId!.Value)
            .Distinct()
            .ToList();

        var productosActivos = await dbContext.Productos
            .Where(x => productoIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var loteIdsValidos = new HashSet<int>();
        if (loteIds.Count > 0)
        {
            loteIdsValidos = (await dbContext.Lotes
                    .Where(x => loteIds.Contains(x.Id) && x.Activo)
                    .Select(x => x.Id)
                    .ToListAsync(cancellationToken))
                .ToHashSet();
        }

        foreach (var detalle in detalles)
        {
            if (detalle.Cantidad <= 0)
            {
                throw new BusinessException(
                    "La cantidad de cada detalle debe ser mayor que cero.");
            }

            if (!productosActivos.Contains(detalle.ProductoId))
            {
                throw new NotFoundException(nameof(ProductoEntity), detalle.ProductoId);
            }

            if (detalle.LoteId.HasValue)
            {
                if (!loteIdsValidos.Contains(detalle.LoteId.Value))
                {
                    throw new NotFoundException(nameof(LoteEntity), detalle.LoteId.Value);
                }
            }
        }
    }

    private static ConsumoDetalleEntity CrearDetalle(
        ConsumoInternoDetalleRequest request)
    {
        return new ConsumoDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            Cantidad = request.Cantidad
        };
    }

    private static void ReemplazarDetalles(
        ConsumoEntity entity,
        IReadOnlyCollection<ConsumoInternoDetalleRequest> detalles)
    {
        var incoming = detalles.ToList();

        foreach (var existing in entity.Detalles.Where(x => x.Activo))
        {
            existing.Activo = false;
        }

        foreach (var detalle in incoming)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }
    }

    private static ConsumoInternoResponse Mapear(
        ConsumoEntity entity,
        string? nombreAlmacen,
        string? nombreArea,
        ICollection<ConsumoDetalleEntity>? detalles)
    {
        var response = ConsumoMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            AreaNombre = nombreArea,
            Detalles = (detalles ?? [])
            .Where(x => x.Activo)
            .Select(x => MapearDetalle(x))
            .ToList()
        };
    }

    private static ConsumoInternoDetalleResponse MapearDetalle(
        ConsumoDetalleEntity entity)
    {
        var response = ConsumoMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            LoteNumero = entity.Lote?.NumeroLote
        };
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}