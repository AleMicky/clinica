using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Periodos;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Services;

public sealed class PeriodoService(
    ParametrosDbContext context
) : IPeriodoService
{
    public async Task<PagedResult<PeriodoResponse>> GetPagedAsync(
        PeriodoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Periodos.AsNoTracking();

        if (request.GestionId is { } gestionId && gestionId != Guid.Empty)
            query = query.Where(x => x.GestionId == gestionId);

        return await query
            .OrderBy(x => x.Numero)
            .Select(x => ToResponse(x))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<PeriodoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Periodos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PeriodoResponse> UpdateAsync(
        Guid id,
        UpdatePeriodoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Periodos
            .Include(x => x.Gestion)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Periodo no encontrado.");

        if (request.FechaInicio < entity.Gestion.FechaInicio ||
            request.FechaFin > entity.Gestion.FechaFin)
        {
            throw new BusinessException(
                "Las fechas del periodo deben estar dentro del rango de la gestión.");
        }

        var solapa = await context.Periodos.AnyAsync(
            x => x.GestionId == entity.GestionId &&
                 x.Id != id &&
                 x.FechaInicio <= request.FechaFin &&
                 request.FechaInicio <= x.FechaFin,
            cancellationToken);

        if (solapa)
            throw new BusinessException("El periodo se solapa con otro periodo de la misma gestión.");

        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.Literal = StringNormalize.Required(request.Literal);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    private static PeriodoResponse ToResponse(Periodo entity) =>
        new(
            entity.Id,
            entity.GestionId,
            entity.Numero,
            entity.FechaInicio,
            entity.FechaFin,
            entity.Literal);
}
