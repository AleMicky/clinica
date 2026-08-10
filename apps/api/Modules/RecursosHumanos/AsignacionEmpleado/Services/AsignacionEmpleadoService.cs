using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AsignacionEmpleadoEntity =
    Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Entity.AsignacionEmpleado;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;
using CargoEntity = Clinica.Api.Modules.RecursosHumanos.Cargo.Entity.Cargo;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Services;

public sealed class AsignacionEmpleadoService(AppDbContext dbContext)
    : CrudService<
        AsignacionEmpleadoEntity,
        CreateAsignacionEmpleadoRequest,
        UpdateAsignacionEmpleadoRequest,
        AsignacionEmpleadoResponse
    >(dbContext)
{
    public async Task<PagedResult<AsignacionEmpleadoResponse>> ListarAsync(
        int? empleadoId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (empleadoId.HasValue)
            query = query.Where(x => x.EmpleadoId == empleadoId.Value);

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

        return new PagedResult<AsignacionEmpleadoResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    protected override IQueryable<AsignacionEmpleadoEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.Area)
            .Include(x => x.Cargo);
    }

    protected override IQueryable<AsignacionEmpleadoEntity> ApplyOrder(
        IQueryable<AsignacionEmpleadoEntity> query)
    {
        return query.OrderByDescending(x => x.FechaInicio);
    }

    protected override AsignacionEmpleadoEntity MapToNewEntity(
        CreateAsignacionEmpleadoRequest request)
    {
        var entity = AsignacionEmpleadoMapper.ToEntity(request);
        entity.Observacion = NormalizarOpcional(request.Observacion);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateAsignacionEmpleadoRequest request,
        AsignacionEmpleadoEntity entity)
    {
        AsignacionEmpleadoMapper.UpdateEntity(request, entity);
        entity.Observacion = NormalizarOpcional(request.Observacion);
    }

    protected override AsignacionEmpleadoResponse MapToResponse(
        AsignacionEmpleadoEntity entity)
    {
        return new AsignacionEmpleadoResponse
        {
            Id = entity.Id,
            Empleado = MapEmpleadoInfo(entity.Empleado),
            Area = MapAreaInfo(entity.Area),
            Cargo = MapCargoInfo(entity.Cargo),
            FechaInicio = entity.FechaInicio,
            FechaFin = entity.FechaFin,
            Observacion = entity.Observacion,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    protected override IReadOnlyCollection<AsignacionEmpleadoResponse>
        MapToResponseList(IEnumerable<AsignacionEmpleadoEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    public override async Task<AsignacionEmpleadoResponse> CrearAsync(
        CreateAsignacionEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarFksAsync(
            request.EmpleadoId,
            request.AreaId,
            request.CargoId,
            cancellationToken);

        await ValidarUnicaActivaAsync(
            request.EmpleadoId,
            request.FechaInicio,
            null,
            cancellationToken);

        await CerrarAsignacionActivaAsync(
            request.EmpleadoId,
            request.FechaInicio,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await DbContext.Entry(entity)
            .Reference(x => x.Empleado).LoadAsync();
        await DbContext.Entry(entity.Empleado)
            .Reference(x => x.Persona).LoadAsync();
        await DbContext.Entry(entity)
            .Reference(x => x.Area).LoadAsync();
        await DbContext.Entry(entity)
            .Reference(x => x.Cargo).LoadAsync();

        return MapToResponse(entity);
    }

    public override async Task<AsignacionEmpleadoResponse> ActualizarAsync(
        int id,
        UpdateAsignacionEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidarFksAsync(
            request.EmpleadoId,
            request.AreaId,
            request.CargoId,
            cancellationToken);

        if (entity.EmpleadoId != request.EmpleadoId
            && request.FechaFin is null)
        {
            await ValidarUnicaActivaAsync(
                request.EmpleadoId,
                request.FechaInicio,
                id,
                cancellationToken);
        }

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        await DbContext.Entry(entity)
            .Reference(x => x.Empleado).LoadAsync();
        await DbContext.Entry(entity.Empleado)
            .Reference(x => x.Persona).LoadAsync();
        await DbContext.Entry(entity)
            .Reference(x => x.Area).LoadAsync();
        await DbContext.Entry(entity)
            .Reference(x => x.Cargo).LoadAsync();

        return MapToResponse(entity);
    }

    protected override async Task ValidateCreateAsync(
        CreateAsignacionEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateAsignacionEmpleadoRequest request,
        AsignacionEmpleadoEntity entity,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
    }

    protected override IQueryable<AsignacionEmpleadoEntity> ApplySearch(
        IQueryable<AsignacionEmpleadoEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Empleado.CodigoEmpleado.Contains(search) ||
            x.Empleado.Persona.Nombres.Contains(search) ||
            x.Empleado.Persona.ApellidoPaterno.Contains(search) ||
            x.Area.Nombre.Contains(search) ||
            x.Cargo.Nombre.Contains(search));
    }

    private async Task ValidarFksAsync(
        int empleadoId,
        int areaId,
        int cargoId,
        CancellationToken cancellationToken)
    {
        var existeEmpleado = await DbContext.Set<EmpleadoEntity>()
            .AnyAsync(
                x => x.Id == empleadoId && x.Activo,
                cancellationToken);

        if (!existeEmpleado)
            throw new NotFoundException("Empleado", empleadoId);

        var existeArea = await DbContext.Set<AreaEntity>()
            .AnyAsync(
                x => x.Id == areaId && x.Activo,
                cancellationToken);

        if (!existeArea)
            throw new NotFoundException("Area", areaId);

        var existeCargo = await DbContext.Set<CargoEntity>()
            .AnyAsync(
                x => x.Id == cargoId && x.Activo,
                cancellationToken);

        if (!existeCargo)
            throw new NotFoundException("Cargo", cargoId);
    }

    private async Task ValidarUnicaActivaAsync(
        int empleadoId,
        DateOnly fechaInicio,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existeActiva = excludeId is null
            ? await Entities.AnyAsync(
                x => x.EmpleadoId == empleadoId
                     && x.FechaFin == null
                     && x.FechaInicio < fechaInicio,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.EmpleadoId == empleadoId
                     && x.FechaFin == null
                     && x.FechaInicio < fechaInicio
                     && x.Id != excludeId,
                cancellationToken);

        if (existeActiva)
        {
            throw new ConflictException(
                "El empleado ya tiene una asignación activa. " +
                "Use la nueva asignación para transferirlo.");
        }
    }

    private Task CerrarAsignacionActivaAsync(
        int empleadoId,
        DateOnly fechaInicio,
        CancellationToken cancellationToken)
    {
        return Entities
            .Where(x => x.EmpleadoId == empleadoId
                        && x.FechaFin == null)
            .ExecuteUpdateAsync(
                s => s.SetProperty(
                    x => x.FechaFin, fechaInicio),
                cancellationToken);
    }

    private static EmpleadoInfo? MapEmpleadoInfo(EmpleadoEntity? empleado)
    {
        if (empleado is null)
            return null;

        var nombreCompleto = string.Join(" ",
            new[]
            {
                empleado.Persona?.Nombres,
                empleado.Persona?.ApellidoPaterno,
                empleado.Persona?.ApellidoMaterno
            }.Where(x => !string.IsNullOrWhiteSpace(x)));

        return new EmpleadoInfo
        {
            Id = empleado.Id,
            CodigoEmpleado = empleado.CodigoEmpleado,
            NombreCompleto = nombreCompleto
        };
    }

    private static AreaInfo? MapAreaInfo(AreaEntity? area)
    {
        if (area is null)
            return null;

        return new AreaInfo
        {
            Id = area.Id,
            Codigo = area.Codigo,
            Nombre = area.Nombre
        };
    }

    private static CargoInfo? MapCargoInfo(CargoEntity? cargo)
    {
        if (cargo is null)
            return null;

        return new CargoInfo
        {
            Id = cargo.Id,
            Codigo = cargo.Codigo,
            Nombre = cargo.Nombre
        };
    }

    private static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}