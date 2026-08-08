using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using MedicoEspecialidadEntity =
    Clinica.Api.Modules.RecursosHumanos.Medico.Entity.MedicoEspecialidad;
using MedicoEntity = Clinica.Api.Modules.RecursosHumanos.Medico.Entity.Medico;
using EspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity.Especialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Services;

public sealed class MedicoEspecialidadService(AppDbContext dbContext)
{
    public async Task<PagedResult<MedicoEspecialidadResponse>> ListarAsync(
        int empleadoId,
        int medicoId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(empleadoId, medicoId, cancellationToken);

        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.MedicoId == medicoId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Especialidad.Codigo.Contains(normalizedSearch) ||
                x.Especialidad.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderByDescending(x => x.EsPrincipal)
            .ThenBy(x => x.Especialidad.Nombre)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<MedicoEspecialidadResponse>(
            entities.Select(MapToResponse).ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<MedicoEspecialidadResponse> ObtenerAsync(
        int empleadoId,
        int medicoId,
        int id,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(empleadoId, medicoId, cancellationToken);

        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.MedicoId == medicoId
                     && x.Id == id
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("MedicoEspecialidad", id);

        return MapToResponse(entity);
    }

    public async Task<MedicoEspecialidadResponse> CrearAsync(
        int empleadoId,
        int medicoId,
        CreateMedicoEspecialidadRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(empleadoId, medicoId, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);

        var existe = await dbContext.Set<MedicoEspecialidadEntity>()
            .AnyAsync(
                x => x.MedicoId == medicoId
                     && x.EspecialidadId == request.EspecialidadId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El médico ya tiene asignada esa especialidad.");
        }

        var entity = MedicoEspecialidadMapper.ToEntity(request);
        entity.MedicoId = medicoId;
        entity.Activo = true;

        if (entity.EsPrincipal)
        {
            await DesmarcarOtrasPrincipalesAsync(
                medicoId,
                cancellationToken);
        }

        await dbContext.Set<MedicoEspecialidadEntity>()
            .AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        await LoadEspecialidadAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<MedicoEspecialidadResponse> ActualizarAsync(
        int empleadoId,
        int medicoId,
        int id,
        UpdateMedicoEspecialidadRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(empleadoId, medicoId, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);

        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.MedicoId == medicoId
                     && x.Id == id
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("MedicoEspecialidad", id);

        var existe = await dbContext.Set<MedicoEspecialidadEntity>()
            .AnyAsync(
                x => x.Id != id &&
                     x.MedicoId == medicoId &&
                     x.EspecialidadId == request.EspecialidadId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El médico ya tiene asignada esa especialidad.");
        }

        MedicoEspecialidadMapper.UpdateEntity(request, entity);

        if (entity.EsPrincipal)
        {
            await DesmarcarOtrasPrincipalesAsync(
                medicoId,
                id,
                cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        await LoadEspecialidadAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task EliminarAsync(
        int empleadoId,
        int medicoId,
        int id,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(empleadoId, medicoId, cancellationToken);

        var entity = await dbContext.Set<MedicoEspecialidadEntity>()
            .FirstOrDefaultAsync(
                x => x.MedicoId == medicoId
                     && x.Id == id
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException("MedicoEspecialidad", id);

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<MedicoEspecialidadEntity> BuildQuery()
    {
        return dbContext.Set<MedicoEspecialidadEntity>()
            .Include(x => x.Especialidad);
    }

    private async Task EnsureMedicoExistsAsync(
        int empleadoId,
        int medicoId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Set<MedicoEntity>()
            .AnyAsync(
                x => x.Id == medicoId
                     && x.EmpleadoId == empleadoId
                     && x.Activo,
                cancellationToken);

        if (!existe)
            throw new NotFoundException("Medico", medicoId);
    }

    private async Task EnsureEspecialidadExistsAsync(
        int especialidadId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Set<EspecialidadEntity>()
            .AnyAsync(
                x => x.Id == especialidadId && x.Activo,
                cancellationToken);

        if (!existe)
            throw new NotFoundException("Especialidad", especialidadId);
    }

    private Task DesmarcarOtrasPrincipalesAsync(
        int medicoId,
        CancellationToken cancellationToken)
    {
        return dbContext.Set<MedicoEspecialidadEntity>()
            .Where(x => x.MedicoId == medicoId && x.EsPrincipal)
            .ExecuteUpdateAsync(
                s => s.SetProperty(x => x.EsPrincipal, false),
                cancellationToken);
    }

    private Task DesmarcarOtrasPrincipalesAsync(
        int medicoId,
        int excludeId,
        CancellationToken cancellationToken)
    {
        return dbContext.Set<MedicoEspecialidadEntity>()
            .Where(x => x.MedicoId == medicoId
                        && x.Id != excludeId
                        && x.EsPrincipal)
            .ExecuteUpdateAsync(
                s => s.SetProperty(x => x.EsPrincipal, false),
                cancellationToken);
    }

    private async Task LoadEspecialidadAsync(
        MedicoEspecialidadEntity entity,
        CancellationToken cancellationToken)
    {
        if (entity.Especialidad is null)
        {
            await dbContext.Entry(entity)
                .Reference(x => x.Especialidad)
                .LoadAsync(cancellationToken);
        }
    }

    private static MedicoEspecialidadResponse MapToResponse(
        MedicoEspecialidadEntity entity)
    {
        return new MedicoEspecialidadResponse
        {
            Id = entity.Id,
            MedicoId = entity.MedicoId,
            EspecialidadId = entity.EspecialidadId,
            Especialidad = MapEspecialidadInfo(entity.Especialidad),
            EsPrincipal = entity.EsPrincipal,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static EspecialidadInfo? MapEspecialidadInfo(
        EspecialidadEntity? especialidad)
    {
        if (especialidad is null)
            return null;

        return new EspecialidadInfo
        {
            Id = especialidad.Id,
            Codigo = especialidad.Codigo,
            Nombre = especialidad.Nombre
        };
    }
}
