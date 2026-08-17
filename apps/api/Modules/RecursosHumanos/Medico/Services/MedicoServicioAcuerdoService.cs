using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using MedicoServicioAcuerdoEntity =
    Clinica.Api.Modules.RecursosHumanos.Medico.Entity.MedicoServicioAcuerdo;
using MedicoEntity =
    Clinica.Api.Modules.RecursosHumanos.Medico.Entity.Medico;
using ServicioEntity =
    Clinica.Api.Modules.Servicios.Servicios.Entity.Servicio;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Services;

public sealed class MedicoServicioAcuerdoService(AppDbContext dbContext)
{
    public async Task<PagedResult<MedicoServicioAcuerdoResponse>> ListarAsync(
        int empleadoId,
        int medicoId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(
            empleadoId,
            medicoId,
            cancellationToken);

        var query = BuildQuery()
            .AsNoTracking()
            .Where(x =>
                x.MedicoId == medicoId &&
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

        var totalItems = await query.CountAsync(cancellationToken);

        var offset =
            (pagination.ValidPage - 1) *
            pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Servicio.Nombre)
            .ThenByDescending(x => x.FechaInicio)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<MedicoServicioAcuerdoResponse>(
            entities.Select(MapToResponse).ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<MedicoServicioAcuerdoResponse> ObtenerAsync(
        int empleadoId,
        int medicoId,
        int id,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(
            empleadoId,
            medicoId,
            cancellationToken);

        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.MedicoId == medicoId &&
                    x.Id == id &&
                    x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                "MedicoServicioAcuerdo",
                id);
        }

        return MapToResponse(entity);
    }

    public async Task<MedicoServicioAcuerdoResponse> CrearAsync(
        int empleadoId,
        int medicoId,
        CreateMedicoServicioAcuerdoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(
            empleadoId,
            medicoId,
            cancellationToken);

        await EnsureServicioExistsAsync(
            request.ServicioId,
            cancellationToken);

        ValidateImportes(
            request.ImporteServicio,
            request.ImporteMedico);

        ValidateFechas(
            request.FechaInicio,
            request.FechaFin);

        await EnsureNoExisteAcuerdoVigenteAsync(
            medicoId,
            request.ServicioId,
            null,
            cancellationToken);

        var entity =
            MedicoServicioAcuerdoMapper.ToEntity(request);

        entity.MedicoId = medicoId;

        entity.ImporteServicio =
            request.ImporteServicio;

        entity.ImporteMedico =
            request.ImporteMedico;

        entity.ImporteClinica =
            CalcularImporteClinica(
                request.ImporteServicio,
                request.ImporteMedico);

        entity.Activo = true;

        await dbContext
            .Set<MedicoServicioAcuerdoEntity>()
            .AddAsync(entity, cancellationToken);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        await LoadServicioAsync(
            entity,
            cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<MedicoServicioAcuerdoResponse> ActualizarAsync(
        int empleadoId,
        int medicoId,
        int id,
        UpdateMedicoServicioAcuerdoRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(
            empleadoId,
            medicoId,
            cancellationToken);

        await EnsureServicioExistsAsync(
            request.ServicioId,
            cancellationToken);

        ValidateImportes(
            request.ImporteServicio,
            request.ImporteMedico);

        ValidateFechas(
            request.FechaInicio,
            request.FechaFin);

        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x =>
                    x.MedicoId == medicoId &&
                    x.Id == id &&
                    x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                "MedicoServicioAcuerdo",
                id);
        }

        await EnsureNoExisteAcuerdoVigenteAsync(
            medicoId,
            request.ServicioId,
            id,
            cancellationToken);

        MedicoServicioAcuerdoMapper.UpdateEntity(
            request,
            entity);

        entity.ImporteServicio =
            request.ImporteServicio;

        entity.ImporteMedico =
            request.ImporteMedico;

        entity.ImporteClinica =
            CalcularImporteClinica(
                request.ImporteServicio,
                request.ImporteMedico);

        await dbContext.SaveChangesAsync(
            cancellationToken);

        await LoadServicioAsync(
            entity,
            cancellationToken);

        return MapToResponse(entity);
    }

    public async Task EliminarAsync(
        int empleadoId,
        int medicoId,
        int id,
        CancellationToken cancellationToken = default)
    {
        await EnsureMedicoExistsAsync(
            empleadoId,
            medicoId,
            cancellationToken);

        var entity = await dbContext
            .Set<MedicoServicioAcuerdoEntity>()
            .FirstOrDefaultAsync(
                x =>
                    x.MedicoId == medicoId &&
                    x.Id == id &&
                    x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                "MedicoServicioAcuerdo",
                id);
        }

        entity.Activo = false;

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }

    private IQueryable<MedicoServicioAcuerdoEntity> BuildQuery()
    {
        return dbContext
            .Set<MedicoServicioAcuerdoEntity>()
            .Include(x => x.Servicio);
    }

    private async Task EnsureMedicoExistsAsync(
        int empleadoId,
        int medicoId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext
            .Set<MedicoEntity>()
            .AnyAsync(
                x =>
                    x.Id == medicoId &&
                    x.EmpleadoId == empleadoId &&
                    x.Activo,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(
                "Medico",
                medicoId);
        }
    }

    private async Task EnsureServicioExistsAsync(
        int servicioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext
            .Set<ServicioEntity>()
            .AnyAsync(
                x =>
                    x.Id == servicioId &&
                    x.Activo,
                cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(
                "Servicio",
                servicioId);
        }
    }

    private async Task EnsureNoExisteAcuerdoVigenteAsync(
        int medicoId,
        int servicioId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);

        var existe = await dbContext
            .Set<MedicoServicioAcuerdoEntity>()
            .AnyAsync(
                x =>
                    x.MedicoId == medicoId &&
                    x.ServicioId == servicioId &&
                    x.Activo &&
                    (!excludeId.HasValue ||
                     x.Id != excludeId.Value) &&
                    x.FechaInicio <= hoy &&
                    (
                        x.FechaFin == null ||
                        x.FechaFin >= hoy
                    ),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El médico ya tiene un acuerdo vigente para ese servicio.");
        }
    }

    private static void ValidateImportes(
        decimal importeServicio,
        decimal importeMedico)
    {
        if (importeServicio <= 0)
        {
            throw new BusinessException(
                "El importe del servicio debe ser mayor a cero.");
        }

        if (importeMedico < 0)
        {
            throw new BusinessException(
                "El importe del médico no puede ser negativo.");
        }

        if (importeMedico > importeServicio)
        {
            throw new BusinessException(
                "El importe del médico no puede ser mayor al importe del servicio.");
        }
    }

    private static void ValidateFechas(
        DateOnly fechaInicio,
        DateOnly? fechaFin)
    {
        if (fechaFin.HasValue &&
            fechaFin.Value < fechaInicio)
        {
            throw new BusinessException(
                "La fecha fin no puede ser menor a la fecha inicio.");
        }
    }

    private static decimal CalcularImporteClinica(
        decimal importeServicio,
        decimal importeMedico)
    {
        return Math.Round(
            importeServicio - importeMedico,
            2,
            MidpointRounding.AwayFromZero);
    }

    private async Task LoadServicioAsync(
        MedicoServicioAcuerdoEntity entity,
        CancellationToken cancellationToken)
    {
        if (entity.Servicio is null)
        {
            await dbContext.Entry(entity)
                .Reference(x => x.Servicio)
                .LoadAsync(cancellationToken);
        }
    }

    private static MedicoServicioAcuerdoResponse MapToResponse(
        MedicoServicioAcuerdoEntity entity)
    {
        return new MedicoServicioAcuerdoResponse
        {
            Id = entity.Id,

            MedicoId = entity.MedicoId,

            ServicioId = entity.ServicioId,

            Servicio = MapServicioInfo(
                entity.Servicio),

            ImporteServicio =
                entity.ImporteServicio,

            ImporteClinica =
                entity.ImporteClinica,

            ImporteMedico =
                entity.ImporteMedico,

            FechaInicio =
                entity.FechaInicio,

            FechaFin =
                entity.FechaFin,

            Activo =
                entity.Activo,

            FechaCreacion =
                entity.FechaCreacion,

            FechaModificacion =
                entity.FechaModificacion,

            CreadoPor =
                entity.CreadoPor,

            ModificadoPor =
                entity.ModificadoPor
        };
    }

    private static ServicioInfo? MapServicioInfo(
        ServicioEntity? servicio)
    {
        if (servicio is null)
            return null;

        return new ServicioInfo
        {
            Id = servicio.Id,
            Codigo = servicio.Codigo,
            Nombre = servicio.Nombre
        };
    }
}