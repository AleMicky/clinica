using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Existencia.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;
using ExistenciaMapper = Clinica.Api.Modules.Almacenes.Existencia.Mappers.ExistenciaMapper;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
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
        int? loteId,
        decimal cantidad,
        CancellationToken cancellationToken = default);

    Task DisminuirStockAsync(
        int almacenId,
        int productoId,
        int? loteId,
        decimal cantidad,
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
                x.Producto.Nombre.Contains(termino) ||
                (x.Lote != null && x.Lote.NumeroLote.Contains(termino)));
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
            .Include(x => x.Lote)
            .ToListAsync(cancellationToken);

        var items = existencias
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                x.Producto?.Nombre,
                x.Producto?.Codigo,
                x.Lote?.NumeroLote))
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
            .Include(x => x.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existencia is null || !existencia.Activo)
        {
            throw new NotFoundException(nameof(ExistenciaEntity), id);
        }

        return Mapear(
            existencia,
            existencia.Almacen?.Nombre,
            existencia.Producto?.Nombre,
            existencia.Producto?.Codigo,
            existencia.Lote?.NumeroLote);
    }

    public async Task<ExistenciaResponse> CrearAsync(
        CreateExistenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarReferenciasAsync(
            request.AlmacenId,
            request.ProductoId,
            request.LoteId,
            cancellationToken);

        await ValidarCombinacionUnicaAsync(
            request.AlmacenId,
            request.ProductoId,
            request.LoteId,
            idExcluido: null,
            cancellationToken);

        ValidarCantidades(request.Cantidad, request.CantidadReservada);

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
            request.LoteId,
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
            request.LoteId,
            idExcluido: id,
            cancellationToken);

        ValidarCantidades(request.Cantidad, request.CantidadReservada);

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

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AumentarStockAsync(
        int almacenId,
        int productoId,
        int? loteId,
        decimal cantidad,
        CancellationToken cancellationToken = default)
    {
        if (cantidad <= 0)
        {
            throw new BusinessException(
                "La cantidad debe ser mayor que cero.");
        }

        await ValidarReferenciasAsync(
            almacenId,
            productoId,
            loteId,
            cancellationToken);

        var existencia = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.LoteId == loteId &&
                     x.Activo,
                cancellationToken);

        if (existencia is null)
        {
            existencia = new ExistenciaEntity
            {
                AlmacenId = almacenId,
                ProductoId = productoId,
                LoteId = loteId,
                Cantidad = cantidad,
                CantidadReservada = 0
            };

            dbContext.Existencias.Add(existencia);

            return;
        }

        existencia.Cantidad += cantidad;
    }

    public async Task DisminuirStockAsync(
        int almacenId,
        int productoId,
        int? loteId,
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
                     x.LoteId == loteId &&
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
    }

    private async Task ValidarReferenciasAsync(
        int almacenId,
        int productoId,
        int? loteId,
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

        if (!loteId.HasValue)
        {
            return;
        }

        var existeLote = await dbContext.Lotes
            .AnyAsync(
                x => x.Id == loteId.Value &&
                     x.ProductoId == productoId &&
                     x.Activo,
                cancellationToken);

        if (!existeLote)
        {
            throw new NotFoundException(nameof(LoteEntity), loteId.Value);
        }
    }

    private async Task ValidarCombinacionUnicaAsync(
        int almacenId,
        int productoId,
        int? loteId,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Existencias
            .AnyAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.LoteId == loteId &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "Ya existe una existencia para esa combinación de almacén, producto y lote.");
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

    private static ExistenciaResponse Mapear(
        ExistenciaEntity entity,
        string? nombreAlmacen,
        string? nombreProducto,
        string? codigoProducto,
        string? numeroLote)
    {
        var response = ExistenciaMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            ProductoNombre = nombreProducto,
            ProductoCodigo = codigoProducto,
            LoteNumero = numeroLote,
            CantidadDisponible = entity.CantidadDisponible
        };
    }
}