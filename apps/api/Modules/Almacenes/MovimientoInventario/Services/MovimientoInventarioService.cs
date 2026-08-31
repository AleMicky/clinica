using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using MovimientoDetalleEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventarioDetalle;
using MovimientoEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;
using MovimientoMapper = Clinica.Api.Modules.Almacenes.MovimientoInventario.Mappers.MovimientoInventarioMapper;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using TipoMovimientoEntity = Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity.TipoMovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;

public interface IMovimientoInventarioService
{
    Task<PagedResult<MovimientoInventarioResponse>> ListarAsync(
        int? tipoMovimientoInventarioId,
        int? almacenId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<MovimientoInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<MovimientoInventarioResponse> CrearAsync(
        CreateMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task<MovimientoInventarioResponse> ActualizarAsync(
        int id,
        UpdateMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<MovimientoInventarioResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<MovimientoInventarioResponse> AnularAsync(
        int id,
        AnularMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class MovimientoInventarioService(AppDbContext dbContext)
    : IMovimientoInventarioService
{
    public async Task<PagedResult<MovimientoInventarioResponse>> ListarAsync(
        int? tipoMovimientoInventarioId,
        int? almacenId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .MovimientosInventario
            .AsNoTracking()
            .Where(x => x.Activo);

        if (tipoMovimientoInventarioId.HasValue)
        {
            query = query.Where(x => x.TipoMovimientoInventarioId == tipoMovimientoInventarioId.Value);
        }

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
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

        var movimientos = await query
            .OrderByDescending(x => x.FechaMovimiento)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.TipoMovimientoInventario)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = movimientos
            .Select(x => Mapear(
                x,
                x.TipoMovimientoInventario?.Nombre,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<MovimientoInventarioResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<MovimientoInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var movimiento = await dbContext
            .MovimientosInventario
            .AsNoTracking()
            .Include(x => x.TipoMovimientoInventario)
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (movimiento is null || !movimiento.Activo)
        {
            throw new NotFoundException(nameof(MovimientoEntity), id);
        }

        return Mapear(
            movimiento,
            movimiento.TipoMovimientoInventario?.Nombre,
            movimiento.Almacen?.Nombre,
            movimiento.Detalles);
    }

    public async Task<MovimientoInventarioResponse> CrearAsync(
        CreateMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "El movimiento de inventario debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.TipoMovimientoInventarioId,
            request.AlmacenId,
            request.Numero,
            idExcluido: null,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = MovimientoMapper.ToEntity(request);
        NormalizarEncabezado(entity, request);

        dbContext.MovimientosInventario.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<MovimientoInventarioResponse> ActualizarAsync(
        int id,
        UpdateMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "El movimiento de inventario debe tener al menos un detalle.");
        }

        var entity = await dbContext.MovimientosInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(MovimientoEntity), id);
        }

        if (entity.Estado != EstadoMovimientoInventario.Borrador)
        {
            throw new ConflictException(
                "No se puede editar un movimiento que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.TipoMovimientoInventarioId,
            request.AlmacenId,
            request.Numero,
            idExcluido: id,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.TipoMovimientoInventarioId = request.TipoMovimientoInventarioId;
        entity.AlmacenId = request.AlmacenId;
        entity.FechaMovimiento = request.FechaMovimiento;
        entity.ReferenciaTipo = Limpiar(request.ReferenciaTipo);
        entity.ReferenciaId = request.ReferenciaId;
        entity.Observacion = Limpiar(request.Observacion);
        NormalizarNumero(entity, request.Numero);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.MovimientosInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(MovimientoEntity), id);
        }

        if (entity.Estado != EstadoMovimientoInventario.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar un movimiento que no esté en estado Borrador. Anúlalo en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<MovimientoInventarioResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.MovimientosInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(MovimientoEntity), id);
        }

        if (entity.Estado == EstadoMovimientoInventario.Confirmado)
        {
            throw new ConflictException("El movimiento de inventario ya está confirmado.");
        }

        if (entity.Estado == EstadoMovimientoInventario.Anulado)
        {
            throw new ConflictException("No se puede confirmar un movimiento anulado.");
        }

        entity.Estado = EstadoMovimientoInventario.Confirmado;
        entity.FechaConfirmacion = DateTime.UtcNow;
        entity.FechaAnulacion = null;
        entity.MotivoAnulacion = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<MovimientoInventarioResponse> AnularAsync(
        int id,
        AnularMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.MovimientosInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(MovimientoEntity), id);
        }

        if (entity.Estado == EstadoMovimientoInventario.Anulado)
        {
            throw new ConflictException("El movimiento de inventario ya está anulado.");
        }

        if (entity.Estado == EstadoMovimientoInventario.Borrador)
        {
            throw new ConflictException(
                "Un movimiento en estado Borrador debe eliminarse en lugar de anularse.");
        }

        entity.Estado = EstadoMovimientoInventario.Anulado;
        entity.FechaAnulacion = DateTime.UtcNow;
        entity.MotivoAnulacion = request.MotivoAnulacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarEncabezadoAsync(
        int tipoMovimientoInventarioId,
        int almacenId,
        string numero,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var existeTipo = await dbContext.TiposMovimientoInventario
            .AnyAsync(
                x => x.Id == tipoMovimientoInventarioId && x.Activo,
                cancellationToken);

        if (!existeTipo)
        {
            throw new NotFoundException(nameof(TipoMovimientoEntity), tipoMovimientoInventarioId);
        }

        var existeAlmacen = await dbContext.Almacenes
            .AnyAsync(
                x => x.Id == almacenId && x.Activo,
                cancellationToken);

        if (!existeAlmacen)
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenId);
        }

        var numeroNormalizado = NormalizarNumero(numero);

        var existeNumero = await dbContext.MovimientosInventario
            .AnyAsync(
                x => x.Numero == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existeNumero)
        {
            throw new ConflictException(
                $"Ya existe un movimiento de inventario con el número '{numeroNormalizado}'.");
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<MovimientoInventarioDetalleRequest> detalles,
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

            if (detalle.CostoUnitario.HasValue && detalle.CostoUnitario.Value < 0)
            {
                throw new BusinessException(
                    "El costo unitario no puede ser negativo.");
            }
        }
    }

    private static MovimientoDetalleEntity CrearDetalle(
        MovimientoInventarioDetalleRequest request)
    {
        return new MovimientoDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            Cantidad = request.Cantidad,
            CostoUnitario = request.CostoUnitario
        };
    }

    private static void ReemplazarDetalles(
        MovimientoEntity entity,
        IReadOnlyCollection<MovimientoInventarioDetalleRequest> detalles)
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

    private static MovimientoInventarioResponse Mapear(
        MovimientoEntity entity,
        string? nombreTipo,
        string? nombreAlmacen,
        ICollection<MovimientoDetalleEntity>? detalles)
    {
        var response = MovimientoMapper.ToResponse(entity);
        return response with
        {
            TipoMovimientoNombre = nombreTipo,
            AlmacenNombre = nombreAlmacen,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(x => MapearDetalle(x))
                .ToList()
        };
    }

    private static MovimientoInventarioDetalleResponse MapearDetalle(
        MovimientoDetalleEntity entity)
    {
        var response = MovimientoMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            LoteNumero = entity.Lote?.NumeroLote
        };
    }

    private static void NormalizarEncabezado(
        MovimientoEntity entity,
        MovimientoInventarioRequest request)
    {
        entity.Numero = NormalizarNumero(request.Numero);
        entity.ReferenciaTipo = Limpiar(request.ReferenciaTipo);
        entity.Observacion = Limpiar(request.Observacion);
    }

    private static void NormalizarNumero(MovimientoEntity entity, string numero)
    {
        entity.Numero = NormalizarNumero(numero);
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
