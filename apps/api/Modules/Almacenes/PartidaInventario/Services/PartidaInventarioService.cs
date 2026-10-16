using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.PartidaInventario.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using PartidaInventarioEntity = Clinica.Api.Modules.Almacenes.PartidaInventario.Entity.PartidaInventario;
using PartidaInventarioMapper = Clinica.Api.Modules.Almacenes.PartidaInventario.Mappers.PartidaInventarioMapper;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.PartidaInventario.Services;

public interface IPartidaInventarioService
{
    Task<PagedResult<PartidaInventarioResponse>> ListarAsync(
        int? productoId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<PartidaInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<PartidaInventarioResponse> CrearAsync(
        CreatePartidaInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task<PartidaInventarioResponse> ActualizarAsync(
        int id,
        UpdatePartidaInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public sealed class PartidaInventarioService(AppDbContext dbContext)
    : IPartidaInventarioService
{
    public async Task<PagedResult<PartidaInventarioResponse>> ListarAsync(
        int? productoId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .PartidasInventario
            .AsNoTracking()
            .Where(x => x.Activo);

        if (productoId.HasValue)
        {
            query = query.Where(x => x.ProductoId == productoId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x => (x.NumeroPartida != null && x.NumeroPartida.Contains(termino))
                || x.Producto.Nombre.Contains(termino)
                || x.Producto.Codigo.Contains(termino));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var partidas = await query
            .OrderByDescending(x => x.FechaCreacion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Producto)
            .ToListAsync(cancellationToken);

        var items = partidas
            .Select(x => Mapear(
                x,
                x.Producto?.Nombre,
                x.Producto?.Codigo))
            .ToList();

        return new PagedResult<PartidaInventarioResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<PartidaInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .PartidasInventario
            .AsNoTracking()
            .Include(x => x.Producto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(PartidaInventarioEntity), id);
        }

        return Mapear(
            entity,
            entity.Producto?.Nombre,
            entity.Producto?.Codigo);
    }

    public async Task<PartidaInventarioResponse> CrearAsync(
        CreatePartidaInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarProductoAsync(request.ProductoId, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.NumeroPartida))
        {
            await ValidarNumeroUnicoAsync(
                request.ProductoId,
                request.NumeroPartida,
                idExcluido: null,
                cancellationToken);
        }

        var entity = PartidaInventarioMapper.ToEntity(request);
        Normalizar(entity, request);

        dbContext.PartidasInventario.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<PartidaInventarioResponse> ActualizarAsync(
        int id,
        UpdatePartidaInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarProductoAsync(request.ProductoId, cancellationToken);

        var entity = await dbContext.PartidasInventario
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(PartidaInventarioEntity), id);
        }

        if (!string.IsNullOrWhiteSpace(request.NumeroPartida))
        {
            await ValidarNumeroUnicoAsync(
                request.ProductoId,
                request.NumeroPartida,
                idExcluido: id,
                cancellationToken);
        }

        PartidaInventarioMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.PartidasInventario
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(PartidaInventarioEntity), id);
        }

        dbContext.PartidasInventario.Remove(entity);
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
        string numeroPartida,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var numeroNormalizado = NormalizarNumero(numeroPartida);

        var existe = await dbContext.PartidasInventario
            .AnyAsync(
                x => x.ProductoId == productoId &&
                     x.NumeroPartida == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una partida con el número '{numeroNormalizado}' para ese producto.");
        }
    }

    private static void Normalizar(
        PartidaInventarioEntity entity,
        PartidaInventarioRequest request)
    {
        entity.NumeroPartida = string.IsNullOrWhiteSpace(request.NumeroPartida)
            ? null
            : NormalizarNumero(request.NumeroPartida);
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static PartidaInventarioResponse Mapear(
        PartidaInventarioEntity entity,
        string? nombreProducto,
        string? codigoProducto)
    {
        var response = PartidaInventarioMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = nombreProducto,
            ProductoCodigo = codigoProducto
        };
    }
}
