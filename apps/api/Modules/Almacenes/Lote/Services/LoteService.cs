using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Lote.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using LoteMapper = Clinica.Api.Modules.Almacenes.Lote.Mappers.LoteMapper;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.Lote.Services;

public interface ILoteService
{
    Task<PagedResult<LoteResponse>> ListarAsync(
        int? productoId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<LoteResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<LoteResponse> CrearAsync(
        CreateLoteRequest request,
        CancellationToken cancellationToken = default);

    Task<LoteResponse> ActualizarAsync(
        int id,
        UpdateLoteRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public sealed class LoteService(AppDbContext dbContext)
    : ILoteService
{
    public async Task<PagedResult<LoteResponse>> ListarAsync(
        int? productoId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .Lotes
            .AsNoTracking()
            .Where(x => x.Activo);

        if (productoId.HasValue)
        {
            query = query.Where(x => x.ProductoId == productoId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x => x.NumeroLote.Contains(termino));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var lotes = await query
            .OrderByDescending(x => x.FechaCreacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Producto)
            .ToListAsync(cancellationToken);

        var items = lotes
            .Select(x => Mapear(
                x,
                x.Producto?.Nombre,
                x.Producto?.Codigo))
            .ToList();

        return new PagedResult<LoteResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<LoteResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var lote = await dbContext
            .Lotes
            .AsNoTracking()
            .Include(x => x.Producto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (lote is null || !lote.Activo)
        {
            throw new NotFoundException(nameof(LoteEntity), id);
        }

        return Mapear(
            lote,
            lote.Producto?.Nombre,
            lote.Producto?.Codigo);
    }

    public async Task<LoteResponse> CrearAsync(
        CreateLoteRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarProductoAsync(request.ProductoId, cancellationToken);

        await ValidarNumeroUnicoAsync(
            request.ProductoId,
            request.NumeroLote,
            idExcluido: null,
            cancellationToken);

        ValidarFechas(request.FechaFabricacion, request.FechaVencimiento);

        var entity = LoteMapper.ToEntity(request);
        Normalizar(entity, request);

        dbContext.Lotes.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<LoteResponse> ActualizarAsync(
        int id,
        UpdateLoteRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarProductoAsync(request.ProductoId, cancellationToken);

        var entity = await dbContext.Lotes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(LoteEntity), id);
        }

        await ValidarNumeroUnicoAsync(
            request.ProductoId,
            request.NumeroLote,
            idExcluido: id,
            cancellationToken);

        ValidarFechas(request.FechaFabricacion, request.FechaVencimiento);

        LoteMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Lotes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(LoteEntity), id);
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarProductoAsync(
        int productoId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Productos
            .AnyAsync(
                x => x.Id == productoId && x.Activo,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(nameof(ProductoEntity), productoId);
        }
    }

    private async Task ValidarNumeroUnicoAsync(
        int productoId,
        string numeroLote,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var numeroNormalizado = NormalizarNumero(numeroLote);

        var existe = await dbContext.Lotes
            .AnyAsync(
                x => x.ProductoId == productoId &&
                     x.NumeroLote == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un lote con el número '{numeroNormalizado}' para ese producto.");
        }
    }

    private static void ValidarFechas(
        DateOnly? fechaFabricacion,
        DateOnly? fechaVencimiento)
    {
        if (fechaFabricacion.HasValue &&
            fechaVencimiento.HasValue &&
            fechaVencimiento.Value < fechaFabricacion.Value)
        {
            throw new BusinessException(
                "La fecha de vencimiento no puede ser anterior a la fecha de fabricación.");
        }
    }

    private static void Normalizar(
        LoteEntity entity,
        LoteRequest request)
    {
        entity.NumeroLote = NormalizarNumero(request.NumeroLote);
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static LoteResponse Mapear(
        LoteEntity entity,
        string? nombreProducto,
        string? codigoProducto)
    {
        var response = LoteMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = nombreProducto,
            ProductoCodigo = codigoProducto
        };
    }
}
