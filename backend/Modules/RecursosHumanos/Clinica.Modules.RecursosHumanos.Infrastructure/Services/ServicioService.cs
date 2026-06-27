using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Servicios;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class ServicioService(
    RecursosHumanosDbContext context
) : IServicioService
{
    public Task<PagedResult<ServicioResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new ServicioPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<ServicioResponse>> GetPagedAsync(
        ServicioPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Servicios
            .AsNoTracking()
            .Include(x => x.Departamento)
            .AsQueryable();

        if (request.DepartamentoId is { } departamentoId && departamentoId != Guid.Empty)
            query = query.Where(x => x.DepartamentoId == departamentoId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Nombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<ServicioResponse>(items, total, page, pageSize);
    }

    public async Task<ServicioResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Servicios
            .AsNoTracking()
            .Include(x => x.Departamento)
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ServicioResponse> CreateAsync(
        CreateServicioRequest request,
        CancellationToken cancellationToken = default)
    {
        var departamento = await context.Departamentos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.DepartamentoId, cancellationToken);

        if (departamento is null)
            throw new BusinessException("El departamento no existe.");

        var codigo = Normalize(request.Codigo);

        await EnsureCodigoIsUniqueAsync(
            request.DepartamentoId,
            codigo,
            null,
            cancellationToken);

        var entity = new Servicio
        {
            DepartamentoId = request.DepartamentoId,
            Codigo = codigo,
            Nombre = Normalize(request.Nombre),
            Descripcion = NormalizeOptional(request.Descripcion)
        };

        context.Servicios.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity, departamento.Nombre);
    }

    public async Task<ServicioResponse> UpdateAsync(
        Guid id,
        UpdateServicioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Servicios
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Servicio no encontrado.");

        var departamento = await context.Departamentos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.DepartamentoId, cancellationToken);

        if (departamento is null)
            throw new BusinessException("El departamento no existe.");

        var codigo = Normalize(request.Codigo);

        await EnsureCodigoIsUniqueAsync(
            request.DepartamentoId,
            codigo,
            id,
            cancellationToken);

        entity.DepartamentoId = request.DepartamentoId;
        entity.Codigo = codigo;
        entity.Nombre = Normalize(request.Nombre);
        entity.Descripcion = NormalizeOptional(request.Descripcion);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity, departamento.Nombre);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Servicios
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Servicio no encontrado.");

        context.Servicios.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodigoIsUniqueAsync(
        Guid departamentoId,
        string codigo,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Servicios
            .AnyAsync(x =>
                    x.DepartamentoId == departamentoId &&
                    x.Codigo == codigo &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("El código ya existe en este departamento.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string value)
    {
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static ServicioResponse ToResponse(Servicio entity)
    {
        return new ServicioResponse(
            entity.Id,
            entity.DepartamentoId,
            entity.Departamento.Nombre,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty);
    }

    private static ServicioResponse ToResponse(Servicio entity, string departamentoNombre)
    {
        return new ServicioResponse(
            entity.Id,
            entity.DepartamentoId,
            departamentoNombre,
            entity.Codigo,
            entity.Nombre,
            entity.Descripcion ?? string.Empty);
    }
}
