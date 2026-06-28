using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Prescripciones;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class PrescripcionService(AtencionMedicaDbContext context) : IPrescripcionService
{
    public Task<PagedResult<PrescripcionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new PrescripcionPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<PrescripcionResponse>> GetPagedAsync(
        PrescripcionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Prescripciones.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<PrescripcionResponse>(items, total, page, pageSize);
    }

    public async Task<PrescripcionResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.Prescripciones.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<PrescripcionResponse> CreateAsync(
        CreatePrescripcionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);

        var entity = new Prescripcion
        {
            AtencionId = request.AtencionId,
            Fecha = request.Fecha ?? DateTime.UtcNow,
            Observaciones = NormalizeOptional(request.Observaciones)
        };

        context.Prescripciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<PrescripcionResponse> UpdateAsync(
        Guid id,
        UpdatePrescripcionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Prescripciones.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Prescripción no encontrada.");

        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);

        entity.AtencionId = request.AtencionId;
        entity.Fecha = request.Fecha ?? entity.Fecha;
        entity.Observaciones = NormalizeOptional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Prescripciones.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Prescripción no encontrada.");

        context.Prescripciones.Remove(entity);
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

    private static PrescripcionResponse ToResponse(Prescripcion entity) =>
        new(entity.Id, entity.AtencionId, entity.Fecha, entity.Observaciones);
}
