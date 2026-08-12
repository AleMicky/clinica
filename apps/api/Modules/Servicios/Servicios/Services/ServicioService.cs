using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Dtos;
using Clinica.Api.Modules.Servicios.Servicios.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Servicios.Servicios.Services;

public sealed class ServicioService(AppDbContext dbContext)
{
    public async Task<PagedResult<ServicioResponse>> ListarAsync(
        int categoriaId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureCategoriaExistsAsync(categoriaId, cancellationToken);

        var query = dbContext.Servicio
            .AsNoTracking()
            .Where(x => x.CategoriaServicioId == categoriaId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Codigo.Contains(normalizedSearch) ||
                x.Nombre.Contains(normalizedSearch) ||
                (x.Descripcion != null && x.Descripcion.Contains(normalizedSearch)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Nombre)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ServicioResponse>(
            ServicioMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<ServicioResponse> ObtenerAsync(
        int categoriaId,
        int servicioId,
        CancellationToken cancellationToken = default)
    {
        await EnsureCategoriaExistsAsync(categoriaId, cancellationToken);

        var entity = await dbContext.Servicio
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.CategoriaServicioId == categoriaId
                     && x.Id == servicioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("Servicio", servicioId);

        return ServicioMapper.ToResponse(entity);
    }


    public async Task<List<ServicioTarifarioResponse>> ServicioTarifarioAsync(
        int categoriaId,
        int? tarifarioId = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureCategoriaExistsAsync(categoriaId, cancellationToken);

        var hoy = DateOnly.FromDateTime(DateTime.Today);

        var tarifario = await dbContext.Tarifarios
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    (tarifarioId.HasValue
                        ? x.Id == tarifarioId.Value
                        : x.EsPrincipal)
                    && x.FechaInicio <= hoy
                    && (x.FechaFin == null || x.FechaFin >= hoy),
                cancellationToken);

        if (tarifario is null)
        {
            throw new BusinessException(
                tarifarioId.HasValue
                    ? "El tarifario seleccionado no existe o no está vigente."
                    : "No existe un tarifario principal vigente.");
        }

        return await dbContext.TarifarioDetalles
            .AsNoTracking()
            .Where(x =>
                x.TarifarioId == tarifario.Id &&
                x.Servicio.CategoriaServicioId == categoriaId &&
                x.Servicio.Activo)
            .OrderBy(x => x.Servicio.Nombre)
            .Select(x => new ServicioTarifarioResponse
            {
                Id = x.Servicio.Id,
                CategoriaServicioId = x.Servicio.CategoriaServicioId,
                Codigo = x.Servicio.Codigo,
                Nombre = x.Servicio.Nombre,
                Precio = x.Precio
            })
            .ToListAsync(cancellationToken);
    }


    public async Task<ServicioResponse> CrearAsync(
        int categoriaId,
        CreateServicioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCategoriaExistsAsync(categoriaId, cancellationToken);

        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await dbContext.Servicio.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un servicio con el código '{codigo}'.");
        }

        var entity = ServicioMapper.ToEntity(request);
        entity.CategoriaServicioId = categoriaId;
        entity.Codigo = codigo;
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = Limpiar(request.Descripcion);
        entity.Activo = true;

        await dbContext.Servicio.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ServicioMapper.ToResponse(entity);
    }

    public async Task<ServicioResponse> ActualizarAsync(
        int categoriaId,
        int servicioId,
        UpdateServicioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureCategoriaExistsAsync(categoriaId, cancellationToken);

        var entity = await dbContext.Servicio
            .FirstOrDefaultAsync(
                x => x.CategoriaServicioId == categoriaId
                     && x.Id == servicioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("Servicio", servicioId);

        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await dbContext.Servicio.AnyAsync(
            x => x.Id != servicioId &&
                 x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otro servicio con el código '{codigo}'.");
        }

        entity.Codigo = codigo;
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = Limpiar(request.Descripcion);

        await dbContext.SaveChangesAsync(cancellationToken);

        return ServicioMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int categoriaId,
        int servicioId,
        CancellationToken cancellationToken = default)
    {
        await EnsureCategoriaExistsAsync(categoriaId, cancellationToken);

        var entity = await dbContext.Servicio
            .FirstOrDefaultAsync(
                x => x.CategoriaServicioId == categoriaId
                     && x.Id == servicioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("Servicio", servicioId);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCategoriaExistsAsync(
        int categoriaId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.CategoriaServicio
            .AnyAsync(x => x.Id == categoriaId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(CategoriaServicio), categoriaId);
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}