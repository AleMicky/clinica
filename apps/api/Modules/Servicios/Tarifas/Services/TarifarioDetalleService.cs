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

public interface ITarifarioDetalleService
{
    Task<PagedResult<TarifarioDetalleResponse>> ListarAsync(
        int tarifarioId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default);

    Task<TarifarioDetalleResponse> ObtenerAsync(
        int tarifarioId,
        int detalleId,
        CancellationToken cancellationToken = default);

    Task<TarifarioDetalleResponse> CrearAsync(
        int tarifarioId,
        CreateTarifarioDetalleRequest request,
        CancellationToken cancellationToken = default);

    Task<TarifarioDetalleResponse> ActualizarAsync(
        int tarifarioId,
        int detalleId,
        UpdateTarifarioDetalleRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int tarifarioId,
        int detalleId,
        CancellationToken cancellationToken = default);

    Task<List<TarifarioDetalleResponse>> CrearCatalogoAsync(
        int tarifarioId,
        TarifarioDetalleCategoriaRequest request,
        CancellationToken cancellationToken = default);

    Task<decimal> ObtenerPrecioAsync(
        int servicioId,
        int? convenioId,
        DateTime fecha,
        CancellationToken cancellationToken = default);
}

public sealed class TarifarioDetalleService(AppDbContext dbContext) : ITarifarioDetalleService
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

        var query = dbContext.TarifariosDetalles
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
        await EnsureTarifarioExistsAsync(
            tarifarioId,
            cancellationToken);

        var entity = await dbContext.TarifariosDetalles
            .AsNoTracking()
            .Include(x => x.Servicio)
            .FirstOrDefaultAsync(
                x => x.TarifarioId == tarifarioId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        return entity is null
            ? throw new NotFoundException(
                "TarifarioDetalle",
                detalleId)
            : TarifarioDetalleMapper.ToResponse(entity);
    }

    public async Task<TarifarioDetalleResponse> CrearAsync(
        int tarifarioId,
        CreateTarifarioDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(
            tarifarioId,
            cancellationToken);

        await EnsureServicioExistsAsync(
            request.ServicioId,
            cancellationToken);

        // IMPORTANTE: no filtrar por Activo.
        var existente = await dbContext.TarifariosDetalles
            .FirstOrDefaultAsync(
                x => x.TarifarioId == tarifarioId &&
                     x.ServicioId == request.ServicioId,
                cancellationToken);

        if (existente is not null)
        {
            if (existente.Activo)
            {
                throw new ConflictException(
                    $"El servicio '{request.ServicioId}' ya tiene un precio en este tarifario.");
            }

            // Estaba eliminado lógicamente: reutilizarlo.
            existente.Activo = true;
            existente.Precio = request.Precio;

            await dbContext.SaveChangesAsync(
                cancellationToken);

            return await ObtenerAsync(
                tarifarioId,
                existente.Id,
                cancellationToken);
        }

        // Solo INSERT si jamás existió.
        var entity = TarifarioDetalleMapper.ToEntity(request);

        entity.TarifarioId = tarifarioId;
        entity.Activo = true;

        await dbContext.TarifariosDetalles.AddAsync(entity, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(tarifarioId, entity.Id, cancellationToken);
    }

    public async Task<TarifarioDetalleResponse> ActualizarAsync(
        int tarifarioId,
        int detalleId,
        UpdateTarifarioDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(
            tarifarioId,
            cancellationToken);

        var entity = await dbContext.TarifariosDetalles
            .FirstOrDefaultAsync(
                x => x.TarifarioId == tarifarioId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(TarifarioDetalleEntity), detalleId);
        }

        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);

        var existe = await dbContext.TarifariosDetalles.AnyAsync(
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
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(
            tarifarioId,
            detalleId,
            cancellationToken);
    }

    public async Task EliminarAsync(int tarifarioId, int detalleId, CancellationToken cancellationToken = default)
    {
        await EnsureTarifarioExistsAsync(tarifarioId, cancellationToken);

        var entity = await dbContext.TarifariosDetalles
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
            throw new BusinessException("No existen servicios activos en la categoría seleccionada.");
        }


        var existentes = await dbContext.TarifariosDetalles
            .Where(x =>
                x.TarifarioId == tarifarioId &&
                servicios.Contains(x.ServicioId))
            .ToListAsync(cancellationToken);

        var existentesPorServicio = existentes
            .ToDictionary(x => x.ServicioId);

        var afectados = new List<int>();

        foreach (var servicioId in servicios)
        {
            if (existentesPorServicio.TryGetValue(
                    servicioId,
                    out var detalle))
            {
                if (detalle.Activo)
                    continue;

                detalle.Activo = true;
                detalle.Precio = 0;
                afectados.Add(detalle.Id);
            }
            else
            {
                var nuevo = new TarifarioDetalleEntity
                {
                    TarifarioId = tarifarioId,
                    ServicioId = servicioId,
                    Precio = 0,
                    Activo = true
                };

                await dbContext.TarifariosDetalles
                    .AddAsync(nuevo, cancellationToken);

                afectados.Add(nuevo.Id);
            }
        }

        if (afectados.Count == 0)
        {
            throw new ConflictException(
                "Todos los servicios de esta categoría ya están agregados al tarifario.");
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var entities = await dbContext.TarifariosDetalles
            .AsNoTracking()
            .Include(x => x.Servicio)
            .Where(x => afectados.Contains(x.Id))
            .OrderBy(x => x.Servicio.Nombre)
            .ToListAsync(cancellationToken);

        return TarifarioDetalleMapper.ToResponse(entities);
    }


    public async Task<decimal> ObtenerPrecioAsync(
        int servicioId,
        int? convenioId,
        DateTime fecha,
        CancellationToken cancellationToken = default)
    {
        var fechaActual = DateOnly.FromDateTime(fecha);

        if (convenioId.HasValue)
        {
            var precioConvenio = await dbContext.TarifariosDetalles
                .AsNoTracking()
                .Where(x =>
                    x.ServicioId == servicioId &&
                    x.Tarifario.Activo &&
                    x.Tarifario.FechaInicio <= fechaActual &&
                    (x.Tarifario.FechaFin == null ||
                     x.Tarifario.FechaFin >= fechaActual) &&
                    x.Tarifario.Convenios.Any(c =>
                        c.ConvenioId == convenioId.Value))
                .Select(x => (decimal?)x.Precio)
                .FirstOrDefaultAsync(cancellationToken);

            if (precioConvenio.HasValue)
            {
                return precioConvenio.Value;
            }
        }

        var precioNormal = await dbContext.TarifariosDetalles
            .AsNoTracking()
            .Where(x =>
                x.ServicioId == servicioId &&
                x.Tarifario.Activo &&
                x.Tarifario.Activo &&
                x.Tarifario.FechaInicio <= fechaActual &&
                (x.Tarifario.FechaFin == null ||
                 x.Tarifario.FechaFin >= fechaActual))
            .Select(x => (decimal?)x.Precio)
            .FirstOrDefaultAsync(cancellationToken);

        return !precioNormal.HasValue
            ? throw new NotFoundException("Precio del servicio", servicioId)
            : precioNormal.Value;
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