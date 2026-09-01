using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.ReservaStock.Dtos;
using Clinica.Api.Modules.Almacenes.ReservaStock.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using ReservaDetalleEntity = Clinica.Api.Modules.Almacenes.ReservaStock.Entity.ReservaStockDetalle;
using ReservaEntity = Clinica.Api.Modules.Almacenes.ReservaStock.Entity.ReservaStock;
using ReservaMapper = Clinica.Api.Modules.Almacenes.ReservaStock.Mappers.ReservaStockMapper;

namespace Clinica.Api.Modules.Almacenes.ReservaStock.Services;

public interface IReservaStockService
{
    Task<PagedResult<ReservaStockResponse>> ListarAsync(
        int? almacenId,
        EstadoReservaStock? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> CrearAsync(
        CreateReservaStockRequest request,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> ActualizarAsync(
        int id,
        UpdateReservaStockRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> LiberarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> ConsumirAsync(
        int id,
        ConfirmarReservaStockRequest request,
        CancellationToken cancellationToken = default);

    Task<ReservaStockResponse> CancelarAsync(
        int id,
        CancelarReservaStockRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class ReservaStockService(AppDbContext dbContext)
    : IReservaStockService
{
    public async Task<PagedResult<ReservaStockResponse>> ListarAsync(
        int? almacenId,
        EstadoReservaStock? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .ReservasStock
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
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
                x.ReferenciaTipo.Contains(termino) ||
                (x.Observacion != null && x.Observacion.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var reservas = await query
            .OrderByDescending(x => x.FechaReserva)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = reservas
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<ReservaStockResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<ReservaStockResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var reserva = await dbContext
            .ReservasStock
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (reserva is null || !reserva.Activo)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        return Mapear(
            reserva,
            reserva.Almacen?.Nombre,
            reserva.Detalles);
    }

    public async Task<ReservaStockResponse> CrearAsync(
        CreateReservaStockRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La reserva de stock debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.Numero,
            idExcluido: null,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = ReservaMapper.ToEntity(request);
        entity.Numero = NormalizarNumero(request.Numero);
        entity.ReferenciaTipo = request.ReferenciaTipo.Trim();
        entity.Observacion = Limpiar(request.Observacion);

        dbContext.ReservasStock.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<ReservaStockResponse> ActualizarAsync(
        int id,
        UpdateReservaStockRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La reserva de stock debe tener al menos un detalle.");
        }

        var entity = await dbContext.ReservasStock
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        if (entity.Estado != EstadoReservaStock.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una reserva que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.Numero,
            idExcluido: id,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.AlmacenId = request.AlmacenId;
        entity.ReferenciaTipo = request.ReferenciaTipo.Trim();
        entity.ReferenciaId = request.ReferenciaId;
        entity.FechaReserva = request.FechaReserva;
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
        var entity = await dbContext.ReservasStock
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        if (entity.Estado != EstadoReservaStock.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una reserva que no esté en estado Borrador. Cancélala en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<ReservaStockResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ReservasStock
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        if (entity.Estado != EstadoReservaStock.Borrador)
        {
            throw new ConflictException(
                "Solo se puede confirmar una reserva en estado Borrador.");
        }

        entity.Estado = EstadoReservaStock.Confirmada;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<ReservaStockResponse> LiberarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ReservasStock
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        if (entity.Estado == EstadoReservaStock.Liberada)
        {
            throw new ConflictException("La reserva de stock ya está liberada.");
        }

        if (entity.Estado == EstadoReservaStock.Consumida)
        {
            throw new ConflictException("No se puede liberar una reserva ya consumida.");
        }

        if (entity.Estado == EstadoReservaStock.Cancelada)
        {
            throw new ConflictException("No se puede liberar una reserva cancelada.");
        }

        entity.Estado = EstadoReservaStock.Liberada;
        entity.FechaLiberacion = DateTime.UtcNow;
        entity.FechaConsumo = null;

        foreach (var detalle in entity.Detalles)
        {
            detalle.CantidadConsumida = 0;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<ReservaStockResponse> ConsumirAsync(
        int id,
        ConfirmarReservaStockRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ReservasStock
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        if (entity.Estado != EstadoReservaStock.Confirmada)
        {
            throw new ConflictException(
                "Solo se puede consumir una reserva en estado Confirmada.");
        }

        if (request.Cantidades.Count == 0)
        {
            throw new BusinessException(
                "Debe indicar la cantidad consumida de al menos un detalle.");
        }

        ValidarCantidadesConsumidas(entity, request.Cantidades);

        var cantidades = request.Cantidades.ToDictionary(x => x.DetalleId);

        foreach (var detalle in entity.Detalles)
        {
            if (cantidades.TryGetValue(detalle.Id, out var cantidad))
            {
                detalle.CantidadConsumida = cantidad.CantidadConsumida;
            }
        }

        entity.Estado = EstadoReservaStock.Consumida;
        entity.FechaConsumo = DateTime.UtcNow;
        entity.FechaLiberacion = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<ReservaStockResponse> CancelarAsync(
        int id,
        CancelarReservaStockRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ReservasStock
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ReservaEntity), id);
        }

        if (entity.Estado == EstadoReservaStock.Cancelada)
        {
            throw new ConflictException("La reserva de stock ya está cancelada.");
        }

        if (entity.Estado == EstadoReservaStock.Consumida)
        {
            throw new ConflictException("No se puede cancelar una reserva ya consumida.");
        }

        entity.Estado = EstadoReservaStock.Cancelada;
        entity.Observacion = string.IsNullOrWhiteSpace(request.MotivoCancelacion)
            ? entity.Observacion
            : Limpiar(request.MotivoCancelacion);

        if (!entity.FechaConsumo.HasValue)
        {
            entity.FechaLiberacion = null;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private static void ValidarCantidadesConsumidas(
        ReservaEntity entity,
        IReadOnlyCollection<ReservaDetalleCantidadRequest> cantidades)
    {
        var detallesActivos = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(x => x.Id);

        foreach (var cantidad in cantidades)
        {
            if (!detallesActivos.TryGetValue(cantidad.DetalleId, out var detalle))
            {
                throw new NotFoundException(nameof(ReservaDetalleEntity), cantidad.DetalleId);
            }

            if (cantidad.CantidadConsumida < 0)
            {
                throw new BusinessException(
                    "La cantidad consumida no puede ser negativa.");
            }

            if (cantidad.CantidadConsumida > detalle.CantidadReservada)
            {
                throw new BusinessException(
                    "La cantidad consumida no puede superar la cantidad reservada.");
            }
        }
    }

    private async Task ValidarEncabezadoAsync(
        int almacenId,
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

        var numeroNormalizado = NormalizarNumero(numero);

        var existeNumero = await dbContext.ReservasStock
            .AnyAsync(
                x => x.Numero == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existeNumero)
        {
            throw new ConflictException(
                $"Ya existe una reserva de stock con el número '{numeroNormalizado}'.");
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<ReservaStockDetalleRequest> detalles,
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
            if (detalle.CantidadReservada <= 0)
            {
                throw new BusinessException(
                    "La cantidad reservada de cada detalle debe ser mayor que cero.");
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

    private static ReservaDetalleEntity CrearDetalle(
        ReservaStockDetalleRequest request)
    {
        return new ReservaDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            CantidadReservada = request.CantidadReservada,
            CantidadConsumida = 0
        };
    }

    private static void ReemplazarDetalles(
        ReservaEntity entity,
        IReadOnlyCollection<ReservaStockDetalleRequest> detalles)
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

    private static ReservaStockResponse Mapear(
        ReservaEntity entity,
        string? nombreAlmacen,
        ICollection<ReservaDetalleEntity>? detalles)
    {
        var response = ReservaMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(x => MapearDetalle(x))
                .ToList()
        };
    }

    private static ReservaStockDetalleResponse MapearDetalle(
        ReservaDetalleEntity entity)
    {
        var response = ReservaMapper.ToResponse(entity);
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
