using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Estudios;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class EstudioService(AtencionMedicaDbContext context) : IEstudioService
{
    public Task<PagedResult<EstudioResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new EstudioPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<EstudioResponse>> GetPagedAsync(
        EstudioPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Estudios.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim());

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaSolicitud)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<EstudioResponse>(items, total, page, pageSize);
    }

    public async Task<EstudioResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Estudios.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<EstudioResponse> CreateAsync(
        CreateEstudioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        await EnsureTipoEstudioExistsAsync(request.TipoEstudioId, cancellationToken);

        var entity = new Estudio
        {
            AtencionId = request.AtencionId,
            TipoEstudioId = request.TipoEstudioId,
            Nombre = request.Nombre.Trim(),
            Justificacion = NormalizeOptional(request.Justificacion),
            Estado = request.Estado.Trim(),
            FechaSolicitud = request.FechaSolicitud ?? DateTime.UtcNow
        };

        context.Estudios.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<EstudioResponse> UpdateAsync(
        Guid id,
        UpdateEstudioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Estudios.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Estudio no encontrado.");

        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        await EnsureTipoEstudioExistsAsync(request.TipoEstudioId, cancellationToken);

        entity.AtencionId = request.AtencionId;
        entity.TipoEstudioId = request.TipoEstudioId;
        entity.Nombre = request.Nombre.Trim();
        entity.Justificacion = NormalizeOptional(request.Justificacion);
        entity.Estado = request.Estado.Trim();
        entity.FechaSolicitud = request.FechaSolicitud ?? entity.FechaSolicitud;

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Estudios.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Estudio no encontrado.");

        context.Estudios.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAtencionExistsAsync(Guid atencionId, CancellationToken cancellationToken)
    {
        if (!await context.Atenciones.AnyAsync(x => x.Id == atencionId, cancellationToken))
            throw new BusinessException("La atención no existe.");
    }

    private async Task EnsureTipoEstudioExistsAsync(Guid tipoEstudioId, CancellationToken cancellationToken)
    {
        if (!await context.Set<CatalogoItem>().AnyAsync(x => x.Id == tipoEstudioId, cancellationToken))
            throw new BusinessException("El tipo de estudio no existe.");
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static EstudioResponse ToResponse(Estudio entity) =>
        new(
            entity.Id,
            entity.AtencionId,
            entity.TipoEstudioId,
            entity.Nombre,
            entity.Justificacion,
            entity.Estado,
            entity.FechaSolicitud);
}
