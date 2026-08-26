using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using Clinica.Api.Modules.Parametros.Catalogo.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Parametros.Catalogo.Services;

public sealed class CatalogoItemService(AppDbContext dbContext)
{
    public async Task<PagedResult<CatalogoItemResponse>> ListarAsync(
        int grupoId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(grupoId, cancellationToken);

        var query = dbContext.CatalogosItems
            .AsNoTracking()
            .Where(x => x.CatalogoGrupoId == grupoId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Valor.Contains(normalizedSearch) ||
                x.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<CatalogoItemResponse>(
            CatalogoItemMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<PagedResult<CatalogoItemResponse>> ListarPorCodigoAsync(
        string codigo,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var grupo = await dbContext.CatalogosGrupos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Codigo == codigo && x.Activo, cancellationToken);

        if (grupo is null)
            throw new NotFoundException("CatalogoGrupo", codigo);

        return await ListarAsync(grupo.Id, pagination, search, cancellationToken);
    }

    public async Task<CatalogoItemResponse> ObtenerAsync(
        int grupoId,
        int itemId,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(grupoId, cancellationToken);

        var entity = await dbContext.CatalogosItems
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.CatalogoGrupoId == grupoId
                     && x.Id == itemId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("CatalogoItem", itemId);

        return CatalogoItemMapper.ToResponse(entity);
    }

    public async Task<CatalogoItemResponse> CrearAsync(
        int grupoId,
        CreateCatalogoItemRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(grupoId, cancellationToken);

        var valor = request.Valor.Trim();

        var existe = await dbContext.CatalogosItems.AnyAsync(
            x => x.CatalogoGrupoId == grupoId
                 && x.Valor == valor,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un item con el valor '{valor}' en el grupo '{grupoId}'.");
        }

        var entity = CatalogoItemMapper.ToEntity(request);
        entity.CatalogoGrupoId = grupoId;
        entity.Valor = valor;
        entity.Nombre = request.Nombre.Trim();
        entity.Orden = request.Orden;
        entity.Activo = true;

        await dbContext.CatalogosItems.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CatalogoItemMapper.ToResponse(entity);
    }

    public async Task<CatalogoItemResponse> ActualizarAsync(
        int grupoId,
        int itemId,
        UpdateCatalogoItemRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(grupoId, cancellationToken);

        var entity = await dbContext.CatalogosItems
            .FirstOrDefaultAsync(
                x => x.CatalogoGrupoId == grupoId
                     && x.Id == itemId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("CatalogoItem", itemId);

        var valor = request.Valor.Trim();

        var existe = await dbContext.CatalogosItems.AnyAsync(
            x => x.CatalogoGrupoId == grupoId
                 && x.Id != itemId
                 && x.Valor == valor,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otro item con el valor '{valor}' en el grupo '{grupoId}'.");
        }

        CatalogoItemMapper.UpdateEntity(request, entity);
        entity.Valor = valor;
        entity.Nombre = request.Nombre.Trim();
        entity.Orden = request.Orden;

        await dbContext.SaveChangesAsync(cancellationToken);

        return CatalogoItemMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(int grupoId, int itemId, CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(grupoId, cancellationToken);

        var entity = await dbContext.CatalogosItems
            .FirstOrDefaultAsync(
                x => x.CatalogoGrupoId == grupoId && x.Id == itemId,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("CatalogoItem", itemId);

        dbContext.CatalogosItems.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureGrupoExistsAsync(int grupoId, CancellationToken cancellationToken)
    {
        var existe = await dbContext.CatalogosGrupos
            .AnyAsync(x => x.Id == grupoId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException("CatalogoGrupo", grupoId);
    }
}