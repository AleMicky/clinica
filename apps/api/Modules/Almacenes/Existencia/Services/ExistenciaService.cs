using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Existencia.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;
using ExistenciaMapper = Clinica.Api.Modules.Almacenes.Existencia.Mappers.ExistenciaMapper;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.Existencia.Services;

public interface IExistenciaService
{
    Task<PagedResult<ExistenciaResponse>> ListarAsync(
        int? almacenId,
        int? productoId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<ExistenciaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ExistenciaResponse?> ObtenerPorAlmacenYProductoAsync(
        int almacenId,
        int productoId,
        CancellationToken cancellationToken = default);

    Task<ExistenciaResponse> CrearAsync(
        CreateExistenciaRequest request,
        CancellationToken cancellationToken = default);

    Task<ExistenciaResponse> ActualizarAsync(
        int id,
        UpdateExistenciaRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AumentarStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default);

    Task AumentarStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        decimal? costoUnitario,
        CancellationToken cancellationToken = default);

    Task DisminuirStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default);

    Task ReservarStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default);

    Task LiberarStockReservadoAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default);

    Task<ExistenciaResponse> ActualizarCostoPromedioAsync(
        int almacenId,
        int productoId,
        decimal nuevoCostoPromedio,
        CancellationToken cancellationToken = default);
}

public sealed class ExistenciaService(AppDbContext dbContext) : IExistenciaService
{
    public async Task<PagedResult<ExistenciaResponse>> ListarAsync(
        int? almacenId,
        int? productoId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .Existencias
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
        }

        if (productoId.HasValue)
        {
            query = query.Where(x => x.ProductoId == productoId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Producto.Codigo.Contains(termino) ||
                x.Producto.Nombre.Contains(termino));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var existencias = await query
            .OrderByDescending(x => x.FechaCreacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .Include(x => x.Producto)
            .ToListAsync(cancellationToken);

        var items = existencias
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                x.Producto?.Nombre,
                x.Producto?.Codigo))
            .ToList();

        return new PagedResult<ExistenciaResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<ExistenciaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var existencia = await dbContext
            .Existencias
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Producto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existencia is null || !existencia.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaEntity), id);
        }

        return Mapear(
            existencia,
            existencia.Almacen?.Nombre,
            existencia.Producto?.Nombre,
            existencia.Producto?.Codigo);
    }

    public async Task<ExistenciaResponse?> ObtenerPorAlmacenYProductoAsync(
        int almacenId,
        int productoId,
        CancellationToken cancellationToken = default)
    {
        var existencia = await dbContext
            .Existencias
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Producto)
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            return null;
        }

        return Mapear(
            existencia,
            existencia.Almacen?.Nombre,
            existencia.Producto?.Nombre,
            existencia.Producto?.Codigo);
    }

    public async Task<ExistenciaResponse> CrearAsync(
        CreateExistenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.AlmacenId,
            request.ProductoId,
            cancellationToken);

        ValidarCantidades(request.Cantidad, request.CantidadReservada, request.CostoPromedio);

        var existingEntity = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == request.AlmacenId &&
                     x.ProductoId == request.ProductoId,
                cancellationToken);

        if (existingEntity is not null)
        {
            if (existingEntity.Activo)
            {
                throw new ConflictException(
                    "Ya existe una existencia para esa combinación de almacén y producto.");
            }

            existingEntity.Activo = true;
            existingEntity.Cantidad = request.Cantidad;
            existingEntity.CantidadReservada = request.CantidadReservada;
            existingEntity.CostoPromedio = request.CostoPromedio;
            await dbContext.SaveChangesAsync(cancellationToken);

            return await ObtenerAsync(existingEntity.Id, cancellationToken);
        }

        var entity = ExistenciaMapper.ToEntity(request);

        dbContext.Existencias.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<ExistenciaResponse> ActualizarAsync(
        int id,
        UpdateExistenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.AlmacenId,
            request.ProductoId,
            cancellationToken);

        var entity = await dbContext.Existencias
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaEntity), id);
        }

        await ValidarCombinacionUnicaAsync(
            request.AlmacenId,
            request.ProductoId,
            idExcluido: id,
            cancellationToken);

        ValidarCantidades(request.Cantidad, request.CantidadReservada, request.CostoPromedio);

        ExistenciaMapper.UpdateEntity(request, entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Existencias
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaEntity), id);
        }

        if (entity.Cantidad > 0 || entity.CantidadReservada > 0)
        {
            throw new ConflictException(
                "No se puede eliminar una existencia que tiene stock disponible o reservado.");
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task AumentarStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        return AumentarStockAsync(
            almacenId,
            productoId,
            cantidad,
            costoUnitario: null,
            cancellationToken);
    }

    public async Task AumentarStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        decimal? costoUnitario,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException(
                "La cantidad debe ser mayor que cero.");
        }

        if (costoUnitario.HasValue && costoUnitario.Value < 0)
        {
            throw new BusinessException(
                "El costo unitario no puede ser negativo.");
        }

        await ValidarReferenciasAsync(
            almacenId,
            productoId,
            cancellationToken);

        var existencia = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId,
                cancellationToken);

        if (existencia is null)
        {
            existencia = new ExistenciaEntity
            {
                AlmacenId = almacenId,
                ProductoId = productoId,
                Cantidad = cantidad,
                CantidadReservada = 0,
                CostoPromedio = costoUnitario.GetValueOrDefault(0),
                Activo = true
            };

            dbContext.Existencias.Add(existencia);
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        if (!existencia.Activo)
        {
            existencia.Activo = true;
            existencia.Cantidad = 0;
            existencia.CantidadReservada = 0;
            existencia.CostoPromedio = 0;
        }

        if (costoUnitario.HasValue && costoUnitario.Value > 0)
        {
            var stockPrevio = existencia.Cantidad;
            var costoPrevio = existencia.CostoPromedio;
            var valorPrevio = stockPrevio > 0 ? stockPrevio * costoPrevio : 0;
            var valorEntrada = cantidad * costoUnitario.Value;
            var totalCantidad = stockPrevio + cantidad;

            existencia.CostoPromedio = totalCantidad > 0
                ? Math.Round((valorPrevio + valorEntrada) / totalCantidad, 4)
                : costoUnitario.Value;
        }

        existencia.Cantidad += cantidad;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DisminuirStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException(
                "La cantidad debe ser mayor que cero.");
        }

        var existencia = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            throw new BusinessException(
                "No existe stock para el producto seleccionado.");
        }

        if (existencia.CantidadDisponible < cantidad)
        {
            throw new BusinessException(
                $"Stock insuficiente para el producto {productoId}. " +
                $"Disponible: {existencia.CantidadDisponible}, " +
                $"solicitado: {cantidad}.");
        }

        existencia.Cantidad -= cantidad;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ReservarStockAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException("La cantidad a reservar debe ser mayor que cero.");
        }

        var existencia = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            throw new BusinessException(
                $"No existe existencia registrada para el almacén {almacenId} y producto {productoId}.");
        }

        if (existencia.CantidadDisponible < cantidad)
        {
            throw new BusinessException(
                $"Stock disponible insuficiente para reservar. Disponible: {existencia.CantidadDisponible}, solicitado: {cantidad}.");
        }

        existencia.CantidadReservada += cantidad;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task LiberarStockReservadoAsync(
        int almacenId,
        int productoId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException("La cantidad a liberar debe ser mayor que cero.");
        }

        var existencia = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            throw new BusinessException(
                $"No existe existencia registrada para el almacén {almacenId} y producto {productoId}.");
        }

        if (existencia.CantidadReservada < cantidad)
        {
            throw new BusinessException(
                $"No se puede liberar más stock del reservado. Reservado actual: {existencia.CantidadReservada}, solicitado: {cantidad}.");
        }

        existencia.CantidadReservada -= cantidad;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<ExistenciaResponse> ActualizarCostoPromedioAsync(
        int almacenId,
        int productoId,
        decimal nuevoCostoPromedio,
        CancellationToken cancellationToken = default)
    {
        if (nuevoCostoPromedio < 0)
        {
            throw new BusinessException("El costo promedio no puede ser negativo.");
        }

        var existencia = await dbContext.Existencias
            .Include(x => x.Almacen)
            .Include(x => x.Producto)
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            throw new NotFoundException(
                $"No existe existencia activa para el almacén {almacenId} y producto {productoId}.");
        }

        existencia.CostoPromedio = nuevoCostoPromedio;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Mapear(
            existencia,
            existencia.Almacen?.Nombre,
            existencia.Producto?.Nombre,
            existencia.Producto?.Codigo);
    }

    private async Task ValidarReferenciasAsync(
        int almacenId,
        int productoId,
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

        var existeProducto = await dbContext.Productos
            .AnyAsync(
                x => x.Id == productoId && x.Activo,
                cancellationToken);

        if (!existeProducto)
        {
            throw new NotFoundException(nameof(ProductoEntity), productoId);
        }
    }

    private async Task ValidarCombinacionUnicaAsync(
        int almacenId,
        int productoId,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Existencias
            .AnyAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "Ya existe una existencia para esa combinación de almacén y producto.");
        }
    }

    private static void ValidarCantidades(
        decimal cantidad,
        decimal cantidadReservada,
        decimal costoPromedio)
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

        if (costoPromedio < 0)
        {
            throw new BusinessException("El costo promedio no puede ser negativo.");
        }
    }

    private static ExistenciaResponse Mapear(
        ExistenciaEntity entity,
        string? nombreAlmacen,
        string? nombreProducto,
        string? codigoProducto)
    {
        var response = ExistenciaMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            ProductoNombre = nombreProducto,
            ProductoCodigo = codigoProducto,
            CantidadDisponible = entity.CantidadDisponible,
            ValorInventario = entity.ValorInventario
        };
    }
}