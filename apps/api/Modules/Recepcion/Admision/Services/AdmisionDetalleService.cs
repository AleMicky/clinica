using Clinica.Api.Data;
using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Mappers;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;
using AdmisionDetalleEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.AdmisionDetalle;

namespace Clinica.Api.Modules.Recepcion.Admision.Services;

public sealed class AdmisionDetalleService(AppDbContext dbContext)
{
    public async Task<PagedResult<AdmisionDetalleResponse>> ListarAsync(
        int admisionId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdmisionExistsAsync(admisionId, cancellationToken);

        var query = dbContext.AdmisionesDetalles
            .AsNoTracking()
            .Include(x => x.Servicio)
            .Where(x => x.AdmisionId == admisionId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Servicio.Codigo.Contains(normalizedSearch) ||
                x.Servicio.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1)
                     * pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Servicio.Nombre)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AdmisionDetalleResponse>(
            AdmisionDetalleMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<AdmisionDetalleResponse> ObtenerAsync(
        int admisionId,
        int detalleId,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdmisionExistsAsync(admisionId, cancellationToken);

        var entity = await dbContext.AdmisionesDetalles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.AdmisionId == admisionId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionDetalleEntity), detalleId);

        return AdmisionDetalleMapper.ToResponse(entity);
    }

    public async Task<AdmisionDetalleResponse> CrearAsync(
        int admisionId,
        CreateAdmisionDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdmisionExistsAsync(admisionId, cancellationToken);
        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        var existe = await dbContext.AdmisionesDetalles.AnyAsync(
            x => x.AdmisionId == admisionId
                 && x.ServicioId == request.ServicioId
                 && x.Activo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El servicio '{request.ServicioId}' ya está incluido en la admisión.");
        }

        var entity = AdmisionDetalleMapper.ToEntity(request);
        entity.AdmisionId = admisionId;
        entity.Total = request.CalcularTotal();
        entity.Activo = true;

        await dbContext.AdmisionesDetalles.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return AdmisionDetalleMapper.ToResponse(entity);
    }

    public async Task<AdmisionDetalleResponse> ActualizarAsync(
        int admisionId,
        int detalleId,
        UpdateAdmisionDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdmisionExistsAsync(admisionId, cancellationToken);

        var entity = await dbContext.AdmisionesDetalles
            .FirstOrDefaultAsync(
                x => x.AdmisionId == admisionId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionDetalleEntity), detalleId);

        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        var existe = await dbContext.AdmisionesDetalles.AnyAsync(
            x => x.AdmisionId == admisionId
                 && x.Id != detalleId
                 && x.ServicioId == request.ServicioId
                 && x.Activo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El servicio '{request.ServicioId}' ya está incluido en la admisión.");
        }

        AdmisionDetalleMapper.UpdateEntity(request, entity);
        entity.ServicioId = request.ServicioId;
        entity.MedicoId = request.MedicoId;
        entity.Total = request.CalcularTotal();

        await dbContext.SaveChangesAsync(cancellationToken);

        return AdmisionDetalleMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int admisionId,
        int detalleId,
        CancellationToken cancellationToken = default)
    {
        await EnsureAdmisionExistsAsync(admisionId, cancellationToken);

        var entity = await dbContext.AdmisionesDetalles
            .FirstOrDefaultAsync(
                x => x.AdmisionId == admisionId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(AdmisionDetalleEntity), detalleId);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureAdmisionExistsAsync(
        int admisionId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Admisiones
            .AnyAsync(x => x.Id == admisionId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(AdmisionEntity), admisionId);
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

    private async Task EnsureMedicoExistsAsync(
        int? medicoId,
        CancellationToken cancellationToken)
    {
        if (medicoId is null)
            return;

        var existe = await dbContext.Medicos
            .AnyAsync(x => x.Id == medicoId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Medico), medicoId.Value);
    }
}
