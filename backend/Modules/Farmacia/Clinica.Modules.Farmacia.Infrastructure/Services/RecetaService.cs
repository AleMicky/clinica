using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Recetas;
using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.Modules.Farmacia.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Farmacia.Infrastructure.Services;

public sealed class RecetaService(
    FarmaciaDbContext context,
    ICorrelativoService correlativoService) : IRecetaService
{
    public const string CorrelativoCodigo = "FAR_RECETA";

    public async Task<PagedResult<RecetaListItemResponse>> GetPagedAsync(
        RecetaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Recetas.AsNoTracking().AsQueryable();
        if (request.PacienteId.HasValue)
            query = query.Where(x => x.PacienteId == request.PacienteId.Value);
        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.Fecha)
            .Select(x => new RecetaListItemResponse(
                x.Id, x.Numero, x.PacienteId, x.EsExterna, x.Fecha, x.Estado))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<RecetaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Recetas
            .AsNoTracking()
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<RecetaResponse> CreateAsync(
        CreateRecetaRequest request,
        CancellationToken cancellationToken = default)
    {
        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "RX-", Longitud: 6),
            cancellationToken);

        var entity = new Receta
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            PacienteId = request.PacienteId,
            MedicoId = request.MedicoId,
            AtencionId = request.AtencionId,
            EsExterna = request.EsExterna,
            Fecha = DateTime.UtcNow,
            Estado = RecetaEstados.Activa,
            Observaciones = request.Observaciones,
            CreatedAt = DateTime.UtcNow,
            Detalles = request.Detalles.Select(d => new RecetaDetalle
            {
                Id = Guid.NewGuid(),
                ProductoId = d.ProductoId,
                Cantidad = d.Cantidad,
                Indicaciones = d.Indicaciones,
                CreatedAt = DateTime.UtcNow,
            }).ToList(),
        };

        context.Recetas.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task AnularAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Recetas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Receta no encontrada.");

        if (entity.Estado == RecetaEstados.Dispensada)
            throw new BusinessException("No se puede anular una receta ya dispensada.");

        entity.Estado = RecetaEstados.Anulada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }

    private static RecetaResponse Map(Receta entity) =>
        new(
            entity.Id,
            entity.Numero,
            entity.PacienteId,
            entity.MedicoId,
            entity.AtencionId,
            entity.EsExterna,
            entity.Fecha,
            entity.Estado,
            entity.Observaciones,
            entity.WorkflowInstanceId,
            entity.Detalles.Select(d => new RecetaDetalleResponse(
                d.Id, d.ProductoId, d.Cantidad, d.Indicaciones)).ToList());
}
