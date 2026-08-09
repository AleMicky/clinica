using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Clinica.Api.Modules.Servicios.Convenios.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using ConvenioEntity =
    Clinica.Api.Modules.Servicios.Convenios.Entity.Convenio;
using ConvenioTarifarioEntity =
    Clinica.Api.Modules.Servicios.Convenios.Entity.ConvenioTarifario;
using TarifarioEntity =
    Clinica.Api.Modules.Servicios.Tarifas.Entity.Tarifario;

namespace Clinica.Api.Modules.Servicios.Convenios.Services;

public sealed class ConvenioTarifarioService(
    AppDbContext dbContext)
{
    public async Task<PagedResult<ConvenioTarifarioResponse>> ListarAsync(
        int convenioId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(
            convenioId,
            cancellationToken);

        var query = dbContext.ConveniosTarifarios
            .AsNoTracking()
            .Include(x => x.Tarifario)
            .Where(x =>
                x.ConvenioId == convenioId &&
                x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Tarifario.Codigo.Contains(normalizedSearch) ||
                x.Tarifario.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(
            cancellationToken);

        var offset =
            (pagination.ValidPage - 1) *
            pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Tarifario.Nombre)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ConvenioTarifarioResponse>(
            ConvenioTarifarioMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<ConvenioTarifarioResponse> ObtenerAsync(
        int convenioId,
        int convenioTarifarioId,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(
            convenioId,
            cancellationToken);

        var entity = await dbContext.ConveniosTarifarios
            .AsNoTracking()
            .Include(x => x.Tarifario)
            .FirstOrDefaultAsync(
                x => x.ConvenioId == convenioId
                     && x.Id == convenioTarifarioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                nameof(ConvenioTarifarioEntity),
                convenioTarifarioId);
        }

        return ConvenioTarifarioMapper.ToResponse(entity);
    }

    public async Task<ConvenioTarifarioResponse> CrearAsync(
        int convenioId,
        CreateConvenioTarifarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(
            convenioId,
            cancellationToken);

        var tarifario = await GetTarifarioAsync(
            request.TarifarioId,
            cancellationToken);

        await EnsureTarifarioNotAssignedAsync(
            convenioId,
            request.TarifarioId,
            excludeConvenioTarifarioId: null,
            cancellationToken);

        var entity =
            ConvenioTarifarioMapper.ToEntity(request);

        entity.ConvenioId = convenioId;
        entity.TarifarioId = tarifario.Id;
        entity.FechaInicio = tarifario.FechaInicio;
        entity.FechaFin = tarifario.FechaFin;
        entity.Activo = true;

        await dbContext.ConveniosTarifarios.AddAsync(
            entity,
            cancellationToken);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        return await ObtenerAsync(
            convenioId,
            entity.Id,
            cancellationToken);
    }

    public async Task<ConvenioTarifarioResponse> ActualizarAsync(
        int convenioId,
        int convenioTarifarioId,
        UpdateConvenioTarifarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(
            convenioId,
            cancellationToken);

        var entity = await dbContext.ConveniosTarifarios
            .FirstOrDefaultAsync(
                x => x.ConvenioId == convenioId
                     && x.Id == convenioTarifarioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                nameof(ConvenioTarifarioEntity),
                convenioTarifarioId);
        }

        var tarifario = await GetTarifarioAsync(
            request.TarifarioId,
            cancellationToken);

        await EnsureTarifarioNotAssignedAsync(
            convenioId,
            request.TarifarioId,
            convenioTarifarioId,
            cancellationToken);

        ConvenioTarifarioMapper.UpdateEntity(
            request,
            entity);

        entity.TarifarioId = tarifario.Id;
        entity.FechaInicio = tarifario.FechaInicio;
        entity.FechaFin = tarifario.FechaFin;

        await dbContext.SaveChangesAsync(
            cancellationToken);

        return await ObtenerAsync(
            convenioId,
            convenioTarifarioId,
            cancellationToken);
    }

    public async Task EliminarAsync(
        int convenioId,
        int convenioTarifarioId,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(
            convenioId,
            cancellationToken);

        var entity = await dbContext.ConveniosTarifarios
            .FirstOrDefaultAsync(
                x => x.Id == convenioTarifarioId
                     && x.ConvenioId == convenioId,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                nameof(ConvenioTarifarioEntity),
                convenioTarifarioId);
        }

        dbContext.ConveniosTarifarios.Remove(entity);

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }

    private async Task EnsureTarifarioNotAssignedAsync(
        int convenioId,
        int tarifarioId,
        int? excludeConvenioTarifarioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.ConveniosTarifarios
            .AnyAsync(
                x => x.ConvenioId == convenioId
                     && x.TarifarioId == tarifarioId
                     && (!excludeConvenioTarifarioId.HasValue ||
                         x.Id != excludeConvenioTarifarioId.Value),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El tarifario '{tarifarioId}' ya está asignado a este convenio.");
        }
    }

    private async Task<TarifarioEntity> GetTarifarioAsync(
        int tarifarioId,
        CancellationToken cancellationToken)
    {
        var tarifario = await dbContext.Tarifarios
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == tarifarioId &&
                     x.Activo,
                cancellationToken);

        if (tarifario is null)
        {
            throw new NotFoundException(
                nameof(TarifarioEntity),
                tarifarioId);
        }

        return tarifario;
    }

    private async Task EnsureConvenioExistsAsync(
        int convenioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Convenios
            .AnyAsync(
                x => x.Id == convenioId &&
                     x.Activo,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(
                nameof(ConvenioEntity),
                convenioId);
        }
    }
}