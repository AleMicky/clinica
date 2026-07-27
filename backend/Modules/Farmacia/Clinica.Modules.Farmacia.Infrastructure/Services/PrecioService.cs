using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Precios;
using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.Modules.Farmacia.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Farmacia.Infrastructure.Services;

public sealed class PrecioService(FarmaciaDbContext context) : IPrecioService
{
    public async Task<PagedResult<PrecioResponse>> GetPagedAsync(
        PrecioPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Precios.AsNoTracking().AsQueryable();
        if (request.ProductoId.HasValue)
            query = query.Where(x => x.ProductoId == request.ProductoId.Value);

        return await query
            .OrderByDescending(x => x.FechaInicio)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<PrecioResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default) =>
        await context.Precios.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<PrecioResponse?> GetVigenteAsync(
        Guid productoId,
        DateOnly? fecha = null,
        CancellationToken cancellationToken = default)
    {
        var day = fecha ?? DateOnly.FromDateTime(DateTime.UtcNow);
        return await context.Precios.AsNoTracking()
            .Where(x => x.ProductoId == productoId
                && x.FechaInicio <= day
                && (x.FechaFin == null || x.FechaFin >= day))
            .OrderByDescending(x => x.FechaInicio)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PrecioResponse> CreateAsync(
        CreatePrecioRequest request,
        CancellationToken cancellationToken = default)
    {
        await CloseOverlappingAsync(request.ProductoId, request.FechaInicio, request.FechaFin, null, cancellationToken);

        var entity = new Precio
        {
            ProductoId = request.ProductoId,
            Importe = request.Importe,
            FechaInicio = request.FechaInicio,
            FechaFin = request.FechaFin,
            MotivoCambio = request.MotivoCambio ?? string.Empty,
            CreatedAt = DateTime.UtcNow,
        };
        context.Precios.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task<PrecioResponse> UpdateAsync(
        Guid id,
        UpdatePrecioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Precios
            .GetRequiredAsync(id, "Precio no encontrado.", cancellationToken);

        await CloseOverlappingAsync(entity.ProductoId, request.FechaInicio, request.FechaFin, id, cancellationToken);

        entity.Importe = request.Importe;
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.MotivoCambio = request.MotivoCambio ?? string.Empty;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Precios
            .GetRequiredAsync(id, "Precio no encontrado.", cancellationToken);
        context.Precios.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task CloseOverlappingAsync(
        Guid productoId,
        DateOnly fechaInicio,
        DateOnly? fechaFin,
        Guid? excludeId,
        CancellationToken cancellationToken)
    {
        var overlapping = await context.Precios
            .Where(x => x.ProductoId == productoId
                && (excludeId == null || x.Id != excludeId)
                && x.FechaInicio <= (fechaFin ?? DateOnly.MaxValue)
                && fechaInicio <= (x.FechaFin ?? DateOnly.MaxValue))
            .ToListAsync(cancellationToken);

        foreach (var item in overlapping.Where(x => x.FechaFin == null || x.FechaFin >= fechaInicio))
        {
            item.FechaFin = fechaInicio.AddDays(-1);
            item.UpdatedAt = DateTime.UtcNow;
        }
    }

    private static PrecioResponse ToResponse(Precio x) =>
        new(x.Id, x.ProductoId, x.Importe, x.FechaInicio, x.FechaFin, x.MotivoCambio);
}
