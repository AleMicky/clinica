using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.CategoriaProducto.Dtos;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CategoriaProductoEntity = Clinica.Api.Modules.Almacenes.CategoriaProducto.Entity.CategoriaProducto;
using CategoriaProductoMapper = Clinica.Api.Modules.Almacenes.CategoriaProducto.Mappers.CategoriaProductoMapper;

namespace Clinica.Api.Modules.Almacenes.CategoriaProducto.Services;

public interface ICategoriaProductoService
{
    Task<PagedResult<CategoriaProductoResponse>> ListarAsync(
        int? categoriaPadreId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<CategoriaProductoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CategoriaProductoResponse> CrearAsync(
        CreateCategoriaProductoRequest request,
        CancellationToken cancellationToken = default);

    Task<CategoriaProductoResponse> ActualizarAsync(
        int id,
        UpdateCategoriaProductoRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);
}

public sealed class CategoriaProductoService(AppDbContext dbContext)
    : ICategoriaProductoService
{
    public async Task<PagedResult<CategoriaProductoResponse>> ListarAsync(
        int? categoriaPadreId,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .CategoriasProducto
            .AsNoTracking()
            .Where(x => x.Activo);

        if (categoriaPadreId.HasValue)
        {
            query = query.Where(x => x.CategoriaPadreId == categoriaPadreId.Value);
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

        var categorias = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.CategoriaPadre)
            .ToListAsync(cancellationToken);

        var items = categorias
            .Select(x => Mapear(x, x.CategoriaPadre?.Nombre, x.Subcategorias.Count))
            .ToList();

        return new PagedResult<CategoriaProductoResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<CategoriaProductoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var categoria = await dbContext
            .CategoriasProducto
            .AsNoTracking()
            .Include(x => x.CategoriaPadre)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (categoria is null || !categoria.Activo)
        {
            throw new NotFoundException(nameof(CategoriaProductoEntity), id);
        }

        var cantidadSubcategorias = await dbContext
            .CategoriasProducto
            .CountAsync(
                x => x.CategoriaPadreId == id && x.Activo,
                cancellationToken);

        return Mapear(
            categoria,
            categoria.CategoriaPadre?.Nombre,
            cantidadSubcategorias);
    }

    public async Task<CategoriaProductoResponse> CrearAsync(
        CreateCategoriaProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarPadreAsync(request.CategoriaPadreId, cancellationToken);

        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: null,
            cancellationToken);

        var entity = CategoriaProductoMapper.ToEntity(request);
        entity.Codigo = NormalizarCodigo(request.Codigo);
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = Limpiar(request.Descripcion);

        dbContext.CategoriasProducto.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<CategoriaProductoResponse> ActualizarAsync(
        int id,
        UpdateCategoriaProductoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarPadreAsync(request.CategoriaPadreId, cancellationToken);

        var entity = await dbContext.CategoriasProducto
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(CategoriaProductoEntity), id);
        }

        if (request.CategoriaPadreId.HasValue &&
            request.CategoriaPadreId.Value == id)
        {
            throw new BusinessException(
                "Una categoría no puede ser su propia categoría padre.");
        }

        await ValidarCodigoUnicoAsync(
            request.Codigo,
            idExcluido: id,
            cancellationToken);

        CategoriaProductoMapper.UpdateEntity(request, entity);
        entity.Codigo = NormalizarCodigo(request.Codigo);
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = Limpiar(request.Descripcion);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.CategoriasProducto
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(CategoriaProductoEntity), id);
        }

        var tieneSubcategorias = await dbContext.CategoriasProducto
            .AnyAsync(
                x => x.CategoriaPadreId == id && x.Activo,
                cancellationToken);

        if (tieneSubcategorias)
        {
            throw new ConflictException(
                "No se puede eliminar la categoría porque tiene subcategorías asociadas.");
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarPadreAsync(
        int? categoriaPadreId,
        CancellationToken cancellationToken)
    {
        if (!categoriaPadreId.HasValue)
        {
            return;
        }

        var existe = await dbContext.CategoriasProducto
            .AnyAsync(
                x => x.Id == categoriaPadreId.Value && x.Activo,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(nameof(CategoriaProductoEntity), categoriaPadreId.Value);
        }
    }

    private async Task ValidarCodigoUnicoAsync(
        string codigo,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var codigoNormalizado = NormalizarCodigo(codigo);

        var existe = await dbContext.CategoriasProducto
            .AnyAsync(
                x => x.Codigo == codigoNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una categoría de producto con el código '{codigoNormalizado}'.");
        }
    }

    private static CategoriaProductoResponse Mapear(
        CategoriaProductoEntity entity,
        string? nombrePadre,
        int cantidadSubcategorias)
    {
        var response = CategoriaProductoMapper.ToResponse(entity);
        return response with
        {
            CategoriaPadreNombre = nombrePadre,
            CantidadSubcategorias = cantidadSubcategorias
        };
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
