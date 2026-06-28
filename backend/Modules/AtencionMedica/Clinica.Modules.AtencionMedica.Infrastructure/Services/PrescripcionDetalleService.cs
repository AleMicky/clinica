using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.PrescripcionDetalles;
using Clinica.Modules.AtencionMedica.Domain.Entities;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class PrescripcionDetalleService(AtencionMedicaDbContext context) : IPrescripcionDetalleService
{
    public Task<PagedResult<PrescripcionDetalleResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default) =>
        GetPagedAsync(new PrescripcionDetallePagedRequest { Page = request.Page, PageSize = request.PageSize }, cancellationToken);

    public async Task<PagedResult<PrescripcionDetalleResponse>> GetPagedAsync(
        PrescripcionDetallePagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.PrescripcionDetalles.AsNoTracking();

        if (request.PrescripcionId is { } prescripcionId && prescripcionId != Guid.Empty)
            query = query.Where(x => x.PrescripcionId == prescripcionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.MedicamentoNombre)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<PrescripcionDetalleResponse>(items, total, page, pageSize);
    }

    public async Task<PrescripcionDetalleResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await context.PrescripcionDetalles.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<PrescripcionDetalleResponse> CreateAsync(
        CreatePrescripcionDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePrescripcionExistsAsync(request.PrescripcionId, cancellationToken);

        var entity = new PrescripcionDetalle
        {
            PrescripcionId = request.PrescripcionId,
            MedicamentoId = request.MedicamentoId,
            MedicamentoNombre = request.MedicamentoNombre.Trim(),
            Dosis = request.Dosis.Trim(),
            Frecuencia = request.Frecuencia.Trim(),
            Duracion = request.Duracion.Trim(),
            ViaAdministracion = NormalizeOptional(request.ViaAdministracion),
            Indicaciones = NormalizeOptional(request.Indicaciones)
        };

        context.PrescripcionDetalles.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<PrescripcionDetalleResponse> UpdateAsync(
        Guid id,
        UpdatePrescripcionDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.PrescripcionDetalles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Detalle de prescripción no encontrado.");

        await EnsurePrescripcionExistsAsync(request.PrescripcionId, cancellationToken);

        entity.PrescripcionId = request.PrescripcionId;
        entity.MedicamentoId = request.MedicamentoId;
        entity.MedicamentoNombre = request.MedicamentoNombre.Trim();
        entity.Dosis = request.Dosis.Trim();
        entity.Frecuencia = request.Frecuencia.Trim();
        entity.Duracion = request.Duracion.Trim();
        entity.ViaAdministracion = NormalizeOptional(request.ViaAdministracion);
        entity.Indicaciones = NormalizeOptional(request.Indicaciones);

        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.PrescripcionDetalles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Detalle de prescripción no encontrado.");

        context.PrescripcionDetalles.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePrescripcionExistsAsync(Guid prescripcionId, CancellationToken cancellationToken)
    {
        if (!await context.Prescripciones.AnyAsync(x => x.Id == prescripcionId, cancellationToken))
            throw new BusinessException("La prescripción no existe.");
    }

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static PrescripcionDetalleResponse ToResponse(PrescripcionDetalle entity) =>
        new(
            entity.Id,
            entity.PrescripcionId,
            entity.MedicamentoId,
            entity.MedicamentoNombre,
            entity.Dosis,
            entity.Frecuencia,
            entity.Duracion,
            entity.ViaAdministracion,
            entity.Indicaciones);
}
