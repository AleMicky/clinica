using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Mappers;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Services;

public sealed partial class ArqueoCajaService(AppDbContext dbContext)
{
    private AppDbContext DbContext { get; } = dbContext;

    private DbSet<ArqueoCajaEntity> Entities =>
        DbContext.Set<ArqueoCajaEntity>();

    public async Task<PagedResult<ArqueoCajaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        query = ApplySearch(query, normalizedSearch);

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1)
                     * pagination.ValidPageSize;

        var entities = await ApplyOrder(query)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ArqueoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<ArqueoCajaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity);
    }

    public async Task<ArqueoCajaResponse> CrearAsync(
        CreateArqueoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarTurnoAsync(
            request.TurnoCajaId,
            cancellationToken);

        await ValidarMetodosPagoAsync(
            request.Detalles,
            cancellationToken);

        await ValidarMonedasAsync(
            request.Detalles,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<ArqueoCajaResponse> ActualizarAsync(
        int id,
        UpdateArqueoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidarTurnoAsync(
            request.TurnoCajaId,
            cancellationToken);

        await ValidarMetodosPagoAsync(
            request.Detalles,
            cancellationToken);

        await ValidarMonedasAsync(
            request.Detalles,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        entity.Activo = false;
        foreach (var detalle in entity.Detalles.Where(x => x.Activo))
            detalle.Activo = false;

        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<ArqueoCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.Detalles);
    }

    private IQueryable<ArqueoCajaEntity> ApplyOrder(
        IQueryable<ArqueoCajaEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    private IQueryable<ArqueoCajaEntity> ApplySearch(
        IQueryable<ArqueoCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.TurnoCaja.Caja.Codigo.Contains(search) ||
            x.TurnoCaja.Caja.Nombre.Contains(search) ||
            x.Observacion != null && x.Observacion.Contains(search));
    }

    private static NotFoundException CreateNotFoundException(int id)
    {
        return new NotFoundException("ArqueoCaja", id);
    }

    private async Task ValidarTurnoAsync(
        int turnoCajaId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Set<TurnoCajaEntity>()
            .AnyAsync(
                x => x.Id == turnoCajaId && x.Activo,
                cancellationToken);

        if (!existe)
            throw new NotFoundException("TurnoCaja", turnoCajaId);
    }

    private async Task ValidarMetodosPagoAsync(
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Select(x => x.MetodoPagoId)
            .Distinct()
            .ToList();

        var existentes = await DbContext.Set<MetodoPago>()
            .Where(x => ids.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var id in ids.Except(existentes))
            throw new NotFoundException("MetodoPago", id);
    }

    private async Task ValidarMonedasAsync(
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Select(x => x.MonedaId)
            .Distinct()
            .ToList();

        var existentes = await DbContext.Set<Moneda>()
            .Where(x => ids.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var id in ids.Except(existentes))
            throw new NotFoundException("Moneda", id);
    }
}