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

        return entity is null ? throw new NotFoundException("Servicio", servicioId) : ServicioMapper.ToResponse(entity);
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

        var targetTarifarioId = tarifario?.Id ?? 0;

        return await dbContext.Servicio
            .AsNoTracking()
            .Where(s =>
                s.CategoriaServicioId == categoriaId &&
                s.Activo)
            .OrderBy(s => s.Nombre)
            .Select(s => new ServicioTarifarioResponse
            {
                Id = s.Id,
                CategoriaServicioId = s.CategoriaServicioId,
                Codigo = s.Codigo,
                Nombre = s.Nombre,
                Descripcion = s.Descripcion,

                Precio = targetTarifarioId > 0
                    ? dbContext.TarifariosDetalles
                        .Where(td =>
                            td.TarifarioId == targetTarifarioId &&
                            td.ServicioId == s.Id &&
                            td.Activo)
                        .Select(td => (decimal?)td.Precio)
                        .FirstOrDefault() ?? 0m
                    : 0m,

                Medicos = dbContext.MedicosServiciosAcuerdos
                    .Where(a =>
                        a.ServicioId == s.Id &&
                        a.Activo &&
                        a.FechaInicio <= hoy &&
                        (a.FechaFin == null || a.FechaFin >= hoy))
                    .Select(a => new MedicoServicioResponse
                    {
                        MedicoId = a.MedicoId,

                        NombreMedico =
                            a.Medico.Empleado.Persona.Nombres + " " +
                            a.Medico.Empleado.Persona.ApellidoPaterno +
                            (a.Medico.Empleado.Persona.ApellidoMaterno != null
                                ? " " + a.Medico.Empleado.Persona.ApellidoMaterno
                                : "")
                    })
                    .ToList()
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

        // No filtrar por Activo: el índice único global impide dos filas
        // con el mismo Codigo. Si existe una inactiva, se reactiva.
        var existente = await dbContext.Servicio.FirstOrDefaultAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existente is not null)
        {
            if (existente.Activo)
            {
                throw new ConflictException(
                    $"Ya existe un servicio con el código '{codigo}'.");
            }

            existente.CategoriaServicioId = categoriaId;
            existente.Nombre = request.Nombre.Trim();
            existente.Descripcion = Limpiar(request.Descripcion);
            existente.Activo = true;

            await dbContext.SaveChangesAsync(cancellationToken);

            return ServicioMapper.ToResponse(existente);
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

        ServicioMapper.UpdateEntity(request, entity);

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