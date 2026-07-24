using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class CorrelativoService(
    ParametrosDbContext context
) : ICorrelativoService
{
    public async Task<PagedResult<CorrelativoResponse>> GetPagedAsync(
        CorrelativoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Correlativos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Codigo))
        {
            var codigo = request.Codigo.Trim().ToUpperInvariant();
            query = query.Where(x => x.Codigo == codigo);
        }

        if (request.Gestion.HasValue)
            query = query.Where(x => x.Gestion == request.Gestion.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.Gestion)
            .ThenBy(x => x.Codigo)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<CorrelativoResponse>(
            items.Select(ToResponse).ToList(),
            total,
            page,
            pageSize);
    }

    public async Task<CorrelativoResponse> GenerarAsync(
        GenerarCorrelativoRequest request,
        CancellationToken cancellationToken = default)
    {
        var codigo = request.Codigo.Trim().ToUpperInvariant();
        var gestion = request.Gestion ?? DateTime.UtcNow.Year;

        await using var transaction = await context.Database
            .BeginTransactionAsync(cancellationToken);

        var entity = await context.Correlativos
            .FirstOrDefaultAsync(
                x => x.Codigo == codigo && x.Gestion == gestion,
                cancellationToken);

        var now = DateTime.UtcNow;

        if (entity is null)
        {
            entity = new Correlativo
            {
                Codigo = codigo,
                Gestion = gestion,
                UltimoNumero = 1,
                Prefijo = NormalizeOptional(request.Prefijo),
                Longitud = request.Longitud ?? 6,
                FechaCreacion = now
            };

            context.Correlativos.Add(entity);
        }
        else
        {
            entity.UltimoNumero++;
            entity.FechaActualizacion = now;

            if (request.Prefijo is not null)
                entity.Prefijo = NormalizeOptional(request.Prefijo);

            if (request.Longitud.HasValue)
                entity.Longitud = request.Longitud.Value;
        }

        await context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ToResponse(entity);
    }

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }

    private static string Formatear(Correlativo entity)
    {
        var numero = entity.UltimoNumero
            .ToString()
            .PadLeft(entity.Longitud, '0');

        return $"{entity.Prefijo}{numero}";
    }

    private static CorrelativoResponse ToResponse(Correlativo entity)
    {
        return new CorrelativoResponse(
            entity.Id,
            entity.Codigo,
            entity.Gestion,
            entity.UltimoNumero,
            entity.Prefijo,
            entity.Longitud,
            Formatear(entity),
            entity.FechaCreacion,
            entity.FechaActualizacion);
    }
}
