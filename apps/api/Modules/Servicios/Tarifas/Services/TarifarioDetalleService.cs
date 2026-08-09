using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Servicios.Tarifas.Dtos;
using Clinica.Api.Modules.Servicios.Tarifas.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using TarifarioEntity = Clinica.Api.Modules.Servicios.Tarifas.Entity.Tarifario;
using TarifarioDetalleEntity = Clinica.Api.Modules.Servicios.Tarifas.Entity.TarifarioDetalle;

namespace Clinica.Api.Modules.Servicios.Tarifas.Services;

public sealed class TarifarioDetalleService(AppDbContext dbContext)
{
    public async Task<PagedResult<TarifarioDetalleResponse>> ListarAsync(
        int tarifarioId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(
            tarifarioId,
            cancellationToken);

        var query = dbContext.TarifarioDetalles
            .AsNoTracking()
            .Include(x => x.Servicio)
            .Where(x =>
                x.TarifarioId == tarifarioId &&
                x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Servicio.Codigo.Contains(normalizedSearch) ||
                x.Servicio.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(
            cancellationToken);

        var offset =
            (pagination.ValidPage - 1) *
            pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Servicio.Nombre)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        var items = TarifarioDetalleMapper.ToResponse(
            entities);

        return new PagedResult<TarifarioDetalleResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<TarifarioDetalleResponse> ObtenerAsync(
        int tarifarioId,
        int detalleId,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(tarifarioId, cancellationToken);

        var entity = await dbContext.TarifarioDetalles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.TarifarioId == tarifarioId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        return entity is null
            ? throw new NotFoundException("TarifarioDetalle", detalleId)
            : TarifarioDetalleMapper.ToResponse(entity);
    }

    public async Task<TarifarioDetalleResponse> CrearAsync(
        int tarifarioId,
        CreateTarifarioDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(tarifarioId, cancellationToken);
        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);

        var existe = await dbContext.TarifarioDetalles.AnyAsync(
            x => x.TarifarioId == tarifarioId
                 && x.ServicioId == request.ServicioId,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El servicio '{request.ServicioId}' ya tiene un precio en este tarifario.");
        }

        var entity = TarifarioDetalleMapper.ToEntity(request);
        entity.TarifarioId = tarifarioId;
        entity.ServicioId = request.ServicioId;
        entity.Precio = request.Precio;
        entity.Activo = true;

        await dbContext.TarifarioDetalles.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TarifarioDetalleMapper.ToResponse(entity);
    }

    public async Task<TarifarioDetalleResponse> ActualizarAsync(
        int tarifarioId,
        int detalleId,
        UpdateTarifarioDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(tarifarioId, cancellationToken);

        var entity = await dbContext.TarifarioDetalles
            .FirstOrDefaultAsync(
                x => x.TarifarioId == tarifarioId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("TarifarioDetalle", detalleId);

        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);

        var existe = await dbContext.TarifarioDetalles.AnyAsync(
            x => x.TarifarioId == tarifarioId
                 && x.Id != detalleId
                 && x.ServicioId == request.ServicioId,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El servicio '{request.ServicioId}' ya tiene un precio en este tarifario.");
        }

        TarifarioDetalleMapper.UpdateEntity(request, entity);
        entity.ServicioId = request.ServicioId;
        entity.Precio = request.Precio;

        await dbContext.SaveChangesAsync(cancellationToken);

        return TarifarioDetalleMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int tarifarioId,
        int detalleId,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(tarifarioId, cancellationToken);

        var entity = await dbContext.TarifarioDetalles
            .FirstOrDefaultAsync(
                x => x.TarifarioId == tarifarioId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("TarifarioDetalle", detalleId);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<TarifarioDetalleResponse>> CrearCatalogoAsync(
        int tarifarioId,
        TarifarioDetalleCategoriaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(
            tarifarioId,
            cancellationToken);

        var servicios = await dbContext.Servicio
            .AsNoTracking()
            .Where(x =>
                x.CategoriaServicioId == request.CategoriaServicioId &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        if (servicios.Count == 0)
        {
            throw new NotFoundException("No existen servicios activos en la categoría seleccionada.");
        }

        var serviciosYaAgregados = await dbContext.TarifarioDetalles
            .AsNoTracking()
            .Where(x =>
                x.TarifarioId == tarifarioId &&
                servicios.Contains(x.ServicioId))
            .Select(x => x.ServicioId)
            .ToListAsync(cancellationToken);

        var nuevosServicios = servicios
            .Except(serviciosYaAgregados)
            .ToList();

        if (nuevosServicios.Count == 0)
        {
            throw new ConflictException(
                "Todos los servicios de esta categoría ya están agregados al tarifario.");
        }

        var detalles = nuevosServicios
            .Select(servicioId => new TarifarioDetalleEntity
            {
                TarifarioId = tarifarioId,
                ServicioId = servicioId,
                Precio = 0,
                Activo = true
            })
            .ToList();

        await dbContext.TarifarioDetalles.AddRangeAsync(
            detalles,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        return TarifarioDetalleMapper.ToResponse(detalles);
    }

    private async Task EnsureTarifarioExistsAsync(
        int tarifarioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Tarifarios
            .AnyAsync(x => x.Id == tarifarioId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(TarifarioEntity), tarifarioId);
    }

    private async Task EnsureServicioExistsAsync(
        int servicioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Servicio
            .AnyAsync(x => x.Id == servicioId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Servicio), servicioId);
    }
}