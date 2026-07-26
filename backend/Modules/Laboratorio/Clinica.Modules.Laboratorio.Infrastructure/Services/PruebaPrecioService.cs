using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.PruebaPrecios;
using Clinica.Modules.Laboratorio.Domain.Entities;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Laboratorio.Infrastructure.Services;

public sealed class PruebaPrecioService(LaboratorioDbContext context) : IPruebaPrecioService
{
    private const string NotFoundMessage = "Precio de prueba no encontrado.";

    public Task<PagedResult<PruebaPrecioResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new PruebaPrecioPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<PruebaPrecioResponse>> GetPagedAsync(
        PruebaPrecioPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.PruebaPrecios.AsNoTracking();

        if (request.PruebaId is { } pruebaId && pruebaId != Guid.Empty)
            query = query.Where(x => x.PruebaId == pruebaId);

        return await query
            .OrderByDescending(x => x.FechaInicio)
            .ThenByDescending(x => x.CreatedAt)
            .Select(ProjectToResponse)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<PruebaPrecioResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.PruebaPrecios
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(ProjectToResponse)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PruebaPrecioResponse> CreateAsync(
        CreatePruebaPrecioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePruebaExistsAsync(request.PruebaId, cancellationToken);
        await EnsureNoOverlapAsync(
            request.PruebaId,
            request.FechaInicio,
            request.FechaFin,
            null,
            cancellationToken);

        var entity = new PruebaPrecio
        {
            PruebaId = request.PruebaId,
            ImporteFacturado = request.ImporteFacturado,
            CostoLaboratorio = request.CostoLaboratorio,
            CostoDerivacion = request.CostoDerivacion,
            FechaInicio = request.FechaInicio,
            FechaFin = request.FechaFin,
            MotivoCambio = StringNormalize.Required(request.MotivoCambio),
        };

        context.PruebaPrecios.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<PruebaPrecioResponse> UpdateAsync(
        Guid id,
        UpdatePruebaPrecioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.PruebaPrecios.GetRequiredAsync(
            id,
            NotFoundMessage,
            cancellationToken);

        await EnsurePruebaExistsAsync(request.PruebaId, cancellationToken);
        await EnsureNoOverlapAsync(
            request.PruebaId,
            request.FechaInicio,
            request.FechaFin,
            id,
            cancellationToken);

        entity.PruebaId = request.PruebaId;
        entity.ImporteFacturado = request.ImporteFacturado;
        entity.CostoLaboratorio = request.CostoLaboratorio;
        entity.CostoDerivacion = request.CostoDerivacion;
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.MotivoCambio = StringNormalize.Required(request.MotivoCambio);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.PruebaPrecios.GetRequiredAsync(
            id,
            NotFoundMessage,
            cancellationToken);

        context.PruebaPrecios.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static System.Linq.Expressions.Expression<Func<PruebaPrecio, PruebaPrecioResponse>> ProjectToResponse =>
        x => new PruebaPrecioResponse(
            x.Id,
            x.PruebaId,
            x.ImporteFacturado,
            x.CostoLaboratorio,
            x.CostoDerivacion,
            x.FechaInicio,
            x.FechaFin,
            x.MotivoCambio);

    private static PruebaPrecioResponse ToResponse(PruebaPrecio entity) =>
        new(
            entity.Id,
            entity.PruebaId,
            entity.ImporteFacturado,
            entity.CostoLaboratorio,
            entity.CostoDerivacion,
            entity.FechaInicio,
            entity.FechaFin,
            entity.MotivoCambio);

    private async Task EnsurePruebaExistsAsync(
        Guid pruebaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Pruebas
            .AnyAsync(x => x.Id == pruebaId, cancellationToken);

        if (!exists)
            throw new BusinessException("La prueba no existe.");
    }

    private async Task EnsureNoOverlapAsync(
        Guid pruebaId,
        DateOnly fechaInicio,
        DateOnly? fechaFin,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var query = context.PruebaPrecios
            .Where(x => x.PruebaId == pruebaId);

        if (currentId is { } id)
            query = query.Where(x => x.Id != id);

        var overlaps = await query.AnyAsync(
            x =>
                x.FechaInicio <= (fechaFin ?? DateOnly.MaxValue) &&
                fechaInicio <= (x.FechaFin ?? DateOnly.MaxValue),
            cancellationToken);

        if (overlaps)
            throw new BusinessException(
                "Ya existe un precio con vigencia que se solapa para esta prueba.");
    }
}
