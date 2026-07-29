using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Programacion;
using Clinica.Modules.RecursosHumanos.Domain.Enums;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Persistence;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;
using ProgramacionEntity = Clinica.Modules.RecursosHumanos.Domain.Entities.Programacion;

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Services;

public sealed class ProgramacionService(RecursosHumanosDbContext context) : IProgramacionService
{
    public Task<PagedResult<ProgramacionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new ProgramacionPagedRequest { Page = request.Page, PageSize = request.PageSize },
            cancellationToken);
    }

    public async Task<PagedResult<ProgramacionResponse>> GetPagedAsync(
        ProgramacionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(includeTracking: false);

        if (request.GrupoProgramacionId is { } grupoId && grupoId != Guid.Empty)
            query = query.Where(x => x.GrupoProgramacionId == grupoId);

        if (request.Estado is { } estado)
            query = query.Where(x => (int)x.Estado == estado);

        if (request.FechaDesde is { } desde)
            query = query.Where(x => x.FechaFin >= desde);

        if (request.FechaHasta is { } hasta)
            query = query.Where(x => x.FechaInicio <= hasta);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Nombre.Contains(search) ||
                x.GrupoProgramacion.Nombre.Contains(search) ||
                x.GrupoProgramacion.Area.Nombre.Contains(search));
        }

        var paged = await query
            .OrderByDescending(x => x.FechaInicio)
            .ThenBy(x => x.Nombre)
            .ToPagedResultAsync(request, cancellationToken);

        var responses = paged.Items.Select(ToResponse).ToList();

        return new PagedResult<ProgramacionResponse>(
            responses,
            paged.TotalRecords,
            paged.Page,
            paged.PageSize);
    }

    public async Task<ProgramacionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery(includeTracking: false)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity is null ? null : ToResponse(entity);
    }

    public async Task<ProgramacionResponse> CreateAsync(
        CreateProgramacionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(request.GrupoProgramacionId, cancellationToken);

        var entity = new ProgramacionEntity
        {
            Nombre = StringNormalize.Required(request.Nombre),
            FechaInicio = request.FechaInicio,
            FechaFin = request.FechaFin,
            GrupoProgramacionId = request.GrupoProgramacionId,
            Estado = EstadoProgramacion.Borrador,
            Observacion = StringNormalize.Optional(request.Observacion)
        };

        context.Programacion.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<ProgramacionResponse> UpdateAsync(
        Guid id,
        UpdateProgramacionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureGrupoExistsAsync(request.GrupoProgramacionId, cancellationToken);

        var entity = await context.Programacion
            .GetRequiredAsync(id, "Programación no encontrada.", cancellationToken);

        if (entity.Estado is EstadoProgramacion.Cerrada or EstadoProgramacion.Cancelada)
            throw new BusinessException("No se puede editar una programación cerrada o cancelada.");

        entity.Nombre = StringNormalize.Required(request.Nombre);
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.GrupoProgramacionId = request.GrupoProgramacionId;
        entity.Observacion = StringNormalize.Optional(request.Observacion);

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Programacion
            .GetRequiredAsync(id, "Programación no encontrada.", cancellationToken);

        if (entity.Estado is not (EstadoProgramacion.Borrador or EstadoProgramacion.Cancelada))
            throw new BusinessException("Solo se pueden eliminar programaciones en borrador o canceladas.");

        var tieneDetalles = await context.ProgramacionDiaria
            .AnyAsync(x => x.ProgramacionId == id, cancellationToken);

        if (tieneDetalles)
            throw new BusinessException("No se puede eliminar una programación con asignaciones diarias.");

        context.Programacion.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProgramacionResponse> UpdateEstadoAsync(
        Guid id,
        UpdateProgramacionEstadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Programacion
            .GetRequiredAsync(id, "Programación no encontrada.", cancellationToken);

        EnsureTransicionValida(entity.Estado, request.Estado);
        entity.Estado = request.Estado;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    private IQueryable<ProgramacionEntity> BuildQuery(bool includeTracking)
    {
        IQueryable<ProgramacionEntity> query = context.Programacion
            .Include(x => x.GrupoProgramacion)
            .ThenInclude(x => x.Area);

        return includeTracking ? query : query.AsNoTracking();
    }

    private async Task EnsureGrupoExistsAsync(Guid grupoId, CancellationToken cancellationToken)
    {
        if (!await context.GrupoProgramacion.AnyAsync(x => x.Id == grupoId, cancellationToken))
            throw new BusinessException("El grupo de programación no existe.");
    }

    private static void EnsureTransicionValida(EstadoProgramacion actual, EstadoProgramacion nuevo)
    {
        if (actual == nuevo)
            return;

        var valida = actual switch
        {
            EstadoProgramacion.Borrador => nuevo is EstadoProgramacion.Publicada or EstadoProgramacion.Cancelada,
            EstadoProgramacion.Publicada => nuevo is EstadoProgramacion.Cerrada
                or EstadoProgramacion.Borrador
                or EstadoProgramacion.Cancelada,
            EstadoProgramacion.Cerrada => nuevo is EstadoProgramacion.Cancelada,
            EstadoProgramacion.Cancelada => false,
            _ => false
        };

        if (!valida)
            throw new BusinessException($"No se puede cambiar el estado de {actual} a {nuevo}.");
    }

    private static ProgramacionResponse ToResponse(ProgramacionEntity x) =>
        new(
            x.Id,
            x.Nombre,
            x.FechaInicio,
            x.FechaFin,
            x.GrupoProgramacionId,
            x.GrupoProgramacion.Nombre,
            x.GrupoProgramacion.AreaId,
            x.GrupoProgramacion.Area.Nombre,
            x.Estado,
            x.Observacion);
}
