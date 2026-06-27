using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoItems;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class CatalogoItemService(
    ParametrosDbContext context
) : ICatalogoItemService
{
    public Task<PagedResult<CatalogoItemResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new CatalogoItemPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<CatalogoItemResponse>> GetPagedAsync(
        CatalogoItemPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.CatalogoItems
            .AsNoTracking();

        if (request.CatalogoGrupoId is { } catalogoGrupoId && catalogoGrupoId != Guid.Empty)
            query = query.Where(x => x.CatalogoGrupoId == catalogoGrupoId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<CatalogoItemResponse>(
            items,
            total,
            page,
            pageSize);
    }

    public async Task<CatalogoItemResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.CatalogoItems
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CatalogoItemResponse> CreateAsync(
        CreateCatalogoItemRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(request.CatalogoGrupoId, cancellationToken);

        var codigo = Normalize(request.Codigo);

        await EnsureCodigoIsUniqueAsync(
            request.CatalogoGrupoId,
            codigo,
            null,
            cancellationToken);

        var entity = new CatalogoItem
        {
            CatalogoGrupoId = request.CatalogoGrupoId,
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            Valor = Normalize(request.Valor),
            Orden = request.Orden
        };

        context.CatalogoItems.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<CatalogoItemResponse> UpdateAsync(
        Guid id,
        UpdateCatalogoItemRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.CatalogoItems
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Ítem de catálogo no encontrado.");

        await EnsureGrupoExistsAsync(request.CatalogoGrupoId, cancellationToken);

        var codigo = Normalize(request.Codigo);

        await EnsureCodigoIsUniqueAsync(
            request.CatalogoGrupoId,
            codigo,
            id,
            cancellationToken);

        entity.CatalogoGrupoId = request.CatalogoGrupoId;
        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Valor = Normalize(request.Valor);
        entity.Orden = request.Orden;

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.CatalogoItems
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Ítem de catálogo no encontrado.");

        context.CatalogoItems.Remove(entity);

        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureGrupoExistsAsync(
        Guid catalogoGrupoId,
        CancellationToken cancellationToken)
    {
        var exists = await context.CatalogoGrupos
            .AnyAsync(x => x.Id == catalogoGrupoId, cancellationToken);

        if (!exists)
            throw new BusinessException("El grupo de catálogo no existe.");
    }

    private async Task EnsureCodigoIsUniqueAsync(
        Guid catalogoGrupoId,
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.CatalogoItems
            .AnyAsync(x =>
                    x.CatalogoGrupoId == catalogoGrupoId &&
                    x.Codigo == codigo &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe en este grupo.");
    }

    private static string Normalize(string value)
    {
        return value.Trim();
    }

    private static CatalogoItemResponse ToResponse(CatalogoItem entity)
    {
        return new CatalogoItemResponse(
            entity.Id,
            entity.CatalogoGrupoId,
            entity.Codigo,
            entity.Nombre,
            entity.Valor,
            entity.Orden);
    }
}
