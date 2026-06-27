using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class CatalogoGrupoService(
    ParametrosDbContext context
) : ICatalogoGrupoService
{
    public async Task<PagedResult<CatalogoGrupoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.CatalogoGrupos
            .AsNoTracking();

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<CatalogoGrupoResponse>(
            items,
            total,
            page,
            pageSize);
    }

    public async Task<CatalogoGrupoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.CatalogoGrupos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CatalogoGrupoResponse> CreateAsync(
        CreateCatalogoGrupoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = Normalize(request.Codigo);

        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new CatalogoGrupo
        {
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            Descripcion = Normalize(request.Descripcion)
        };

        context.CatalogoGrupos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<CatalogoGrupoResponse> UpdateAsync(
        Guid id,
        UpdateCatalogoGrupoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.CatalogoGrupos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Grupo de catálogo no encontrado.");

        var codigo = Normalize(request.Codigo);

        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Descripcion = Normalize(request.Descripcion);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.CatalogoGrupos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Grupo de catálogo no encontrado.");

        context.CatalogoGrupos.Remove(entity);

        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.CatalogoGrupos
            .AnyAsync(x =>
                    x.Codigo == codigo &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe.");
    }

    private static string Normalize(string value)
    {
        return value.Trim();
    }

    private static CatalogoGrupoResponse ToResponse(CatalogoGrupo entity)
    {
        return new CatalogoGrupoResponse(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion);
    }
}