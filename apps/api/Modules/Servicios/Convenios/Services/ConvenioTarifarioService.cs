using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Clinica.Api.Modules.Servicios.Convenios.Mappers;
using Clinica.Api.Modules.Servicios.Tarifas.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using ConvenioEntity = Clinica.Api.Modules.Servicios.Convenios.Entity.Convenio;
using ConvenioTarifarioEntity = Clinica.Api.Modules.Servicios.Convenios.Entity.ConvenioTarifario;

namespace Clinica.Api.Modules.Servicios.Convenios.Services;

public sealed class ConvenioTarifarioService(AppDbContext dbContext)
{
    public async Task<PagedResult<ConvenioTarifarioResponse>> ListarAsync(
        int convenioId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(convenioId, cancellationToken);

        var query = dbContext.ConveniosTarifarios
            .AsNoTracking()
            .Include(x => x.Tarifario)
            .Where(x => x.ConvenioId == convenioId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Tarifario.Codigo.Contains(normalizedSearch) ||
                x.Tarifario.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

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
        int tarifarioId,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(convenioId, cancellationToken);

        var entity = await dbContext.ConveniosTarifarios
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.ConvenioId == convenioId
                     && x.Id == tarifarioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("ConvenioTarifario", tarifarioId);

        return ConvenioTarifarioMapper.ToResponse(entity);
    }

    public async Task<ConvenioTarifarioResponse> CrearAsync(
        int convenioId,
        CreateConvenioTarifarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(convenioId, cancellationToken);
        await EnsureTarifarioExistsAsync(request.TarifarioId, cancellationToken);

        var existe = await dbContext.ConveniosTarifarios.AnyAsync(
            x => x.ConvenioId == convenioId
                 && x.TarifarioId == request.TarifarioId,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El tarifario '{request.TarifarioId}' ya está asignado a este convenio.");
        }

        var entity = ConvenioTarifarioMapper.ToEntity(request);
        entity.ConvenioId = convenioId;
        entity.TarifarioId = request.TarifarioId;
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;
        entity.Activo = true;

        await dbContext.ConveniosTarifarios.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ConvenioTarifarioMapper.ToResponse(entity);
    }

    public async Task<ConvenioTarifarioResponse> ActualizarAsync(
        int convenioId,
        int tarifarioId,
        UpdateConvenioTarifarioRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(convenioId, cancellationToken);

        var entity = await dbContext.ConveniosTarifarios
            .FirstOrDefaultAsync(
                x => x.ConvenioId == convenioId
                     && x.Id == tarifarioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("ConvenioTarifario", tarifarioId);

        await EnsureTarifarioExistsAsync(request.TarifarioId, cancellationToken);

        var existe = await dbContext.ConveniosTarifarios.AnyAsync(
            x => x.ConvenioId == convenioId
                 && x.Id != tarifarioId
                 && x.TarifarioId == request.TarifarioId,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El tarifario '{request.TarifarioId}' ya está asignado a este convenio.");
        }

        ConvenioTarifarioMapper.UpdateEntity(request, entity);
        entity.TarifarioId = request.TarifarioId;
        entity.FechaInicio = request.FechaInicio;
        entity.FechaFin = request.FechaFin;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ConvenioTarifarioMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int convenioId,
        int tarifarioId,
        CancellationToken cancellationToken = default)
    {
        await EnsureConvenioExistsAsync(convenioId, cancellationToken);

        var entity = await dbContext.ConveniosTarifarios
            .FirstOrDefaultAsync(
                x => x.ConvenioId == convenioId
                     && x.Id == tarifarioId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("ConvenioTarifario", tarifarioId);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureConvenioExistsAsync(
        int convenioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Convenios
            .AnyAsync(x => x.Id == convenioId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(ConvenioEntity), convenioId);
    }

    private async Task EnsureTarifarioExistsAsync(
        int tarifarioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Tarifarios
            .AnyAsync(x => x.Id == tarifarioId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Tarifario), tarifarioId);
    }
}
