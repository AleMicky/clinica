using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Tratamientos;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class TratamientoService(AtencionMedicaDbContext context) : ITratamientoService
{
    public Task<PagedResult<TratamientoResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new TratamientoPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<TratamientoResponse>> GetPagedAsync(
        TratamientoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Tratamientos.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaRegistro)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<TratamientoResponse>(items, total, page, pageSize);
    }

    public async Task<TratamientoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Tratamientos.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<TratamientoResponse> CreateAsync(
        CreateTratamientoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);

        var entity = new Tratamiento
        {
            AtencionId = request.AtencionId,
            Descripcion = request.Descripcion.Trim(),
            Indicaciones = NormalizeOptional(request.Indicaciones),
            FechaRegistro = request.FechaRegistro ?? DateTime.UtcNow
        };

        context.Tratamientos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<TratamientoResponse> UpdateAsync(
        Guid id,
        UpdateTratamientoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Tratamientos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Tratamiento no encontrado.");

        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);

        entity.AtencionId = request.AtencionId;
        entity.Descripcion = request.Descripcion.Trim();
        entity.Indicaciones = NormalizeOptional(request.Indicaciones);
        entity.FechaRegistro = request.FechaRegistro ?? entity.FechaRegistro;

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Tratamientos.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Tratamiento no encontrado.");

        context.Tratamientos.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAtencionExistsAsync(Guid atencionId, CancellationToken cancellationToken)
    {
        if (!await context.Atenciones.AnyAsync(x => x.Id == atencionId, cancellationToken))
            throw new BusinessException("La atención no existe.");
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static TratamientoResponse ToResponse(Tratamiento entity) =>
        new(entity.Id, entity.AtencionId, entity.Descripcion, entity.Indicaciones, entity.FechaRegistro);
}
