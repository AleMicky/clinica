using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using TipoMovimientoInventarioEntity = Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity.TipoMovimientoInventario;
using TiposMovimientoInventarioMapper = Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Mappers.TipoMovimientoInventarioMapper;

namespace Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Services;
public interface ITipoMovimientoInventarioService
{
    Task<PagedResult<TipoMovimientoInventarioResponse>> ListarAsync(
        NaturalezaMovimiento? naturaleza,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<TipoMovimientoInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<TipoMovimientoInventarioResponse> CrearAsync(
        CreateTipoMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task<TipoMovimientoInventarioResponse> ActualizarAsync(
        int id,
        UpdateTipoMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public sealed class TipoMovimientoInventarioService(AppDbContext dbContext)
    : ITipoMovimientoInventarioService
{
    public async Task<PagedResult<TipoMovimientoInventarioResponse>> ListarAsync(
        NaturalezaMovimiento? naturaleza,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .TiposMovimientoInventario
            .AsNoTracking()
            .Where(x => x.Activo);

        if (naturaleza.HasValue)
        {
            query = query.Where(x => x.Naturaleza == naturaleza.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Codigo.Contains(termino) ||
                x.Nombre.Contains(termino) ||
                (x.Descripcion != null && x.Descripcion.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var tipos = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = TiposMovimientoInventarioMapper.ToResponse(tipos);

        return new PagedResult<TipoMovimientoInventarioResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<TipoMovimientoInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var tipo = await dbContext
            .TiposMovimientoInventario
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tipo is null || !tipo.Activo)
        {
            throw new NotFoundException(nameof(TipoMovimientoInventarioEntity), id);
        }

        return TiposMovimientoInventarioMapper.ToResponse(tipo);
    }

    public async Task<TipoMovimientoInventarioResponse> CrearAsync(
        CreateTipoMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: null,
            cancellationToken);

        var entity = TiposMovimientoInventarioMapper.ToEntity(request);
        Normalizar(entity, request);

        dbContext.TiposMovimientoInventario.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<TipoMovimientoInventarioResponse> ActualizarAsync(
        int id,
        UpdateTipoMovimientoInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.TiposMovimientoInventario
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(TipoMovimientoInventarioEntity), id);
        }

        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: id,
            cancellationToken);

        TiposMovimientoInventarioMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.TiposMovimientoInventario
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(TipoMovimientoInventarioEntity), id);
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarCodigoUnicoAsync(
        string codigo,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var codigoNormalizado = NormalizarCodigo(codigo);

        var existe = await dbContext.TiposMovimientoInventario
            .AnyAsync(
                x => x.Codigo == codigoNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un tipo de movimiento de inventario con el código '{codigoNormalizado}'.");
        }
    }

    private static void Normalizar(
        TipoMovimientoInventarioEntity entity,
        TipoMovimientoInventarioRequest request)
    {
        entity.Codigo = NormalizarCodigo(request.Codigo);
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = Limpiar(request.Descripcion);
        entity.Naturaleza = request.Naturaleza;
    }

    private static string NormalizarCodigo(string value)
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
