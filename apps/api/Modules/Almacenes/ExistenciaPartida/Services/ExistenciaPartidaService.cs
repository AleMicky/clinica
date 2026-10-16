using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.ExistenciaPartida.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;
using ExistenciaPartidaEntity = Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity.ExistenciaPartida;
using ExistenciaPartidaMapper = Clinica.Api.Modules.Almacenes.ExistenciaPartida.Mappers.ExistenciaPartidaMapper;
using PartidaEntity = Clinica.Api.Modules.Almacenes.PartidaInventario.Entity.PartidaInventario;

namespace Clinica.Api.Modules.Almacenes.ExistenciaPartida.Services;

public interface IExistenciaPartidaService
{
    Task<PagedResult<ExistenciaPartidaResponse>> ListarAsync(
        int? existenciaId,
        int? almacenId,
        int? productoId,
        int? partidaInventarioId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<ExistenciaPartidaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ExistenciaPartidaResponse> CrearAsync(
        CreateExistenciaPartidaRequest request,
        CancellationToken cancellationToken = default);

    Task<ExistenciaPartidaResponse> ActualizarAsync(
        int id,
        UpdateExistenciaPartidaRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AumentarStockAsync(
        int existenciaId,
        int partidaInventarioId,
        decimal cantidad,
        CancellationToken cancellationToken = default);

    Task DisminuirStockAsync(
        int existenciaId,
        int partidaInventarioId,
        decimal cantidad,
        CancellationToken cancellationToken = default);
}

public sealed class ExistenciaPartidaService(AppDbContext dbContext)
    : IExistenciaPartidaService
{
    public async Task<PagedResult<ExistenciaPartidaResponse>> ListarAsync(
        int? existenciaId,
        int? almacenId,
        int? productoId,
        int? partidaInventarioId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .ExistenciasPartidas
            .AsNoTracking()
            .Where(x => x.Activo);

        if (existenciaId.HasValue)
        {
            query = query.Where(x => x.ExistenciaId == existenciaId.Value);
        }

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.Existencia.AlmacenId == almacenId.Value);
        }

        if (productoId.HasValue)
        {
            query = query.Where(x => x.Existencia.ProductoId == productoId.Value);
        }

        if (partidaInventarioId.HasValue)
        {
            query = query.Where(x => x.PartidaInventarioId == partidaInventarioId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                (x.PartidaInventario.NumeroPartida != null && x.PartidaInventario.NumeroPartida.Contains(termino)) ||
                x.Existencia.Producto.Codigo.Contains(termino) ||
                x.Existencia.Producto.Nombre.Contains(termino) ||
                x.Existencia.Almacen.Nombre.Contains(termino));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var existenciasPartidas = await query
            .OrderByDescending(x => x.FechaCreacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Existencia)
                .ThenInclude(e => e.Almacen)
            .Include(x => x.Existencia)
                .ThenInclude(e => e.Producto)
            .Include(x => x.PartidaInventario)
            .ToListAsync(cancellationToken);

        var items = existenciasPartidas
            .Select(Mapear)
            .ToList();

        return new PagedResult<ExistenciaPartidaResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<ExistenciaPartidaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .ExistenciasPartidas
            .AsNoTracking()
            .Include(x => x.Existencia)
                .ThenInclude(e => e.Almacen)
            .Include(x => x.Existencia)
                .ThenInclude(e => e.Producto)
            .Include(x => x.PartidaInventario)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaPartidaEntity), id);
        }

        return Mapear(entity);
    }

    public async Task<ExistenciaPartidaResponse> CrearAsync(
        CreateExistenciaPartidaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.ExistenciaId,
            request.PartidaInventarioId,
            cancellationToken);

        ValidarCantidades(request.Cantidad, request.CantidadReservada);

        var existingEntity = await dbContext.ExistenciasPartidas
            .FirstOrDefaultAsync(
                x => x.ExistenciaId == request.ExistenciaId &&
                     x.PartidaInventarioId == request.PartidaInventarioId,
                cancellationToken);

        if (existingEntity is not null)
        {
            if (existingEntity.Activo)
            {
                throw new ConflictException(
                    "Ya existe una existencia registrada para esa combinación de existencia y partida de inventario.");
            }

            existingEntity.Activo = true;
            existingEntity.Cantidad = request.Cantidad;
            existingEntity.CantidadReservada = request.CantidadReservada;
            await dbContext.SaveChangesAsync(cancellationToken);

            return await ObtenerAsync(existingEntity.Id, cancellationToken);
        }

        var entity = ExistenciaPartidaMapper.ToEntity(request);

        dbContext.ExistenciasPartidas.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<ExistenciaPartidaResponse> ActualizarAsync(
        int id,
        UpdateExistenciaPartidaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.ExistenciaId,
            request.PartidaInventarioId,
            cancellationToken);

        var entity = await dbContext.ExistenciasPartidas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaPartidaEntity), id);
        }

        await ValidarCombinacionUnicaAsync(
            request.ExistenciaId,
            request.PartidaInventarioId,
            idExcluido: id,
            cancellationToken);

        ValidarCantidades(request.Cantidad, request.CantidadReservada);

        ExistenciaPartidaMapper.UpdateEntity(request, entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.ExistenciasPartidas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaPartidaEntity), id);
        }

        if (entity.Cantidad > 0 || entity.CantidadReservada > 0)
        {
            throw new ConflictException("No se puede desvincular o eliminar la partida de la existencia porque tiene stock registrado.");
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AumentarStockAsync(
        int existenciaId,
        int partidaInventarioId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException("La cantidad debe ser mayor que cero.");
        }

        await ValidarReferenciasAsync(
            existenciaId,
            partidaInventarioId,
            cancellationToken);

        var existenciaPartida = await dbContext.ExistenciasPartidas
            .FirstOrDefaultAsync(
                x => x.ExistenciaId == existenciaId &&
                     x.PartidaInventarioId == partidaInventarioId,
                cancellationToken);

        if (existenciaPartida is null)
        {
            existenciaPartida = new ExistenciaPartidaEntity
            {
                ExistenciaId = existenciaId,
                PartidaInventarioId = partidaInventarioId,
                Cantidad = cantidad,
                CantidadReservada = 0,
                Activo = true
            };

            dbContext.ExistenciasPartidas.Add(existenciaPartida);
        }
        else
        {
            if (!existenciaPartida.Activo)
            {
                existenciaPartida.Activo = true;
                existenciaPartida.Cantidad = 0;
                existenciaPartida.CantidadReservada = 0;
            }

            existenciaPartida.Cantidad += cantidad;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DisminuirStockAsync(
        int existenciaId,
        int partidaInventarioId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException("La cantidad debe ser mayor que cero.");
        }

        var existenciaPartida = await dbContext.ExistenciasPartidas
            .FirstOrDefaultAsync(
                x => x.ExistenciaId == existenciaId &&
                     x.PartidaInventarioId == partidaInventarioId &&
                     x.Activo,
                cancellationToken);

        if (existenciaPartida is null)
        {
            throw new BusinessException(
                "No existe stock registrado para la partida en la existencia seleccionada.");
        }

        if (existenciaPartida.CantidadDisponible < cantidad)
        {
            throw new BusinessException(
                $"Stock insuficiente para la partida seleccionada. " +
                $"Disponible: {existenciaPartida.CantidadDisponible}, solicitado: {cantidad}.");
        }

        existenciaPartida.Cantidad -= cantidad;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarReferenciasAsync(
        int existenciaId,
        int partidaInventarioId,
        CancellationToken cancellationToken)
    {
        var existencia = await dbContext.Existencias
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == existenciaId && x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            throw new NotFoundException(nameof(ExistenciaEntity), existenciaId);
        }

        var partida = await dbContext.PartidasInventario
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == partidaInventarioId && x.Activo,
                cancellationToken);

        if (partida is null)
        {
            throw new NotFoundException(nameof(PartidaEntity), partidaInventarioId);
        }

        if (partida.ProductoId != existencia.ProductoId)
        {
            throw new BusinessException(
                "La partida de inventario no pertenece al producto asociado a la existencia seleccionada.");
        }
    }

    private async Task ValidarCombinacionUnicaAsync(
        int existenciaId,
        int partidaInventarioId,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.ExistenciasPartidas
            .AnyAsync(
                x => x.ExistenciaId == existenciaId &&
                     x.PartidaInventarioId == partidaInventarioId &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "Ya existe una existencia registrada para esa combinación de existencia y partida de inventario.");
        }
    }

    private static void ValidarCantidades(
        decimal cantidad,
        decimal cantidadReservada)
    {
        if (cantidad < 0)
        {
            throw new BusinessException("La cantidad no puede ser negativa.");
        }

        if (cantidadReservada < 0)
        {
            throw new BusinessException("La cantidad reservada no puede ser negativa.");
        }

        if (cantidadReservada > cantidad)
        {
            throw new BusinessException("La cantidad reservada no puede ser mayor que la cantidad.");
        }
    }

    private static ExistenciaPartidaResponse Mapear(
        ExistenciaPartidaEntity entity)
    {
        var response = ExistenciaPartidaMapper.ToResponse(entity);
        return response with
        {
            AlmacenId = entity.Existencia?.AlmacenId ?? 0,
            AlmacenNombre = entity.Existencia?.Almacen?.Nombre,
            ProductoId = entity.Existencia?.ProductoId ?? entity.PartidaInventario?.ProductoId ?? 0,
            ProductoNombre = entity.Existencia?.Producto?.Nombre ?? entity.PartidaInventario?.Producto?.Nombre,
            ProductoCodigo = entity.Existencia?.Producto?.Codigo ?? entity.PartidaInventario?.Producto?.Codigo,
            PartidaInventarioId = entity.PartidaInventarioId,
            NumeroPartida = entity.PartidaInventario?.NumeroPartida,
            FechaVencimiento = entity.PartidaInventario?.FechaVencimiento,
            CostoUnitario = entity.PartidaInventario?.CostoUnitario ?? 0,
            Cantidad = entity.Cantidad,
            CantidadReservada = entity.CantidadReservada,
            CantidadDisponible = entity.CantidadDisponible
        };
    }
}
