using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Especialidades;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class EspecialidadService(
    RecursosHumanosDbContext context
) : IEspecialidadService
{
    public async Task<PagedResult<EspecialidadResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Especialidades.AsNoTracking();

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<EspecialidadResponse>(items, total, page, pageSize);
    }

    public async Task<EspecialidadResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Especialidades
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<EspecialidadResponse> CreateAsync(
        CreateEspecialidadRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, null, cancellationToken);

        var entity = new Especialidad
        {
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            Descripcion = NormalizeOptional(request.Descripcion)
        };

        context.Especialidades.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<EspecialidadResponse> UpdateAsync(
        Guid id,
        UpdateEspecialidadRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Especialidades
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Especialidad no encontrada.");

        var codigo = Normalize(request.Codigo);
        await EnsureCodigoIsUniqueAsync(codigo, id, cancellationToken);

        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Descripcion = NormalizeOptional(request.Descripcion);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Especialidades
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Especialidad no encontrada.");

        context.Especialidades.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Especialidades
            .AnyAsync(x =>
                    x.Codigo == codigo &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string value)
    {
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static EspecialidadResponse ToResponse(Especialidad entity)
    {
        return new EspecialidadResponse(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty);
    }
}
