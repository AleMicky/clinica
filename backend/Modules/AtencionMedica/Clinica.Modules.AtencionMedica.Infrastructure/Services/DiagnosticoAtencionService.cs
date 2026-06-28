using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.DiagnosticoAtenciones;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class DiagnosticoAtencionService(AtencionMedicaDbContext context) : IDiagnosticoAtencionService
{
    public Task<PagedResult<DiagnosticoAtencionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new DiagnosticoAtencionPagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<DiagnosticoAtencionResponse>> GetPagedAsync(
        DiagnosticoAtencionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.DiagnosticoAtenciones.AsNoTracking();

        if (request.AtencionId is { } atencionId && atencionId != Guid.Empty)
            query = query.Where(x => x.AtencionId == atencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.EsPrincipal)
            .ThenBy(x => x.DiagnosticoId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<DiagnosticoAtencionResponse>(items, total, page, pageSize);
    }

    public async Task<DiagnosticoAtencionResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.DiagnosticoAtenciones.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<DiagnosticoAtencionResponse> CreateAsync(
        CreateDiagnosticoAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        await EnsureDiagnosticoExistsAsync(request.DiagnosticoId, cancellationToken);
        await EnsureUniqueAsync(request.AtencionId, request.DiagnosticoId, null, cancellationToken);

        if (request.EsPrincipal)
            await ClearPrincipalAsync(request.AtencionId, null, cancellationToken);

        var entity = new DiagnosticoAtencion
        {
            AtencionId = request.AtencionId,
            DiagnosticoId = request.DiagnosticoId,
            EsPrincipal = request.EsPrincipal,
            Observaciones = NormalizeOptional(request.Observaciones)
        };

        context.DiagnosticoAtenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<DiagnosticoAtencionResponse> UpdateAsync(
        Guid id,
        UpdateDiagnosticoAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.DiagnosticoAtenciones.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Diagnóstico de atención no encontrado.");

        await EnsureAtencionExistsAsync(request.AtencionId, cancellationToken);
        await EnsureDiagnosticoExistsAsync(request.DiagnosticoId, cancellationToken);
        await EnsureUniqueAsync(request.AtencionId, request.DiagnosticoId, id, cancellationToken);

        if (request.EsPrincipal)
            await ClearPrincipalAsync(request.AtencionId, id, cancellationToken);

        entity.AtencionId = request.AtencionId;
        entity.DiagnosticoId = request.DiagnosticoId;
        entity.EsPrincipal = request.EsPrincipal;
        entity.Observaciones = NormalizeOptional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.DiagnosticoAtenciones.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Diagnóstico de atención no encontrado.");

        context.DiagnosticoAtenciones.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAtencionExistsAsync(Guid atencionId, CancellationToken cancellationToken)
    {
        if (!await context.Atenciones.AnyAsync(x => x.Id == atencionId, cancellationToken))
            throw new BusinessException("La atención no existe.");
    }

    private async Task EnsureDiagnosticoExistsAsync(Guid diagnosticoId, CancellationToken cancellationToken)
    {
        if (!await context.Diagnosticos.AnyAsync(x => x.Id == diagnosticoId, cancellationToken))
            throw new BusinessException("El diagnóstico no existe.");
    }

    private async Task EnsureUniqueAsync(Guid atencionId, Guid diagnosticoId, Guid? currentId, CancellationToken cancellationToken)
    {
        var exists = await context.DiagnosticoAtenciones.AnyAsync(
            x => x.AtencionId == atencionId &&
                 x.DiagnosticoId == diagnosticoId &&
                 (!currentId.HasValue || x.Id != currentId.Value),
            cancellationToken);

        if (exists)
            throw new BusinessException("El diagnóstico ya está asociado a esta atención.");
    }

    private async Task ClearPrincipalAsync(Guid atencionId, Guid? exceptId, CancellationToken cancellationToken)
    {
        var principales = await context.DiagnosticoAtenciones
            .Where(x => x.AtencionId == atencionId && x.EsPrincipal &&
                        (!exceptId.HasValue || x.Id != exceptId.Value))
            .ToListAsync(cancellationToken);

        foreach (var item in principales)
            item.EsPrincipal = false;
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static DiagnosticoAtencionResponse ToResponse(DiagnosticoAtencion entity) =>
        new(entity.Id, entity.AtencionId, entity.DiagnosticoId, entity.EsPrincipal, entity.Observaciones);
}
