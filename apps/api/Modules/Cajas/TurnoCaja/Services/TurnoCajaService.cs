using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CajaEntity = Clinica.Api.Modules.Cajas.Caja.Entity.Caja;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Services;

public sealed class TurnoCajaService(AppDbContext dbContext)
{
    private AppDbContext DbContext { get; } = dbContext;

    private DbSet<TurnoCajaEntity> Entities =>
        DbContext.Set<TurnoCajaEntity>();

    public async Task<PagedResult<TurnoCajaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

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

        return new PagedResult<TurnoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<TurnoCajaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity);
    }

    public async Task<TurnoCajaResponse> CrearAsync(
        CreateTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarFksAsync(
            request.CajaId,
            request.EmpleadoId,
            cancellationToken);

        await ValidarUnicoAbiertoAsync(
            request.CajaId,
            null,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<TurnoCajaResponse> ActualizarAsync(
        int id,
        UpdateTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidarFksAsync(
            request.CajaId,
            request.EmpleadoId,
            cancellationToken);

        await ValidarUnicoAbiertoAsync(
            request.CajaId,
            id,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        Entities.Remove(entity);

        await DbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<TurnoCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.Caja)
            .Include(x => x.Empleado).ThenInclude(e => e.Persona);
    }

    private IQueryable<TurnoCajaEntity> ApplyOrder(
        IQueryable<TurnoCajaEntity> query)
    {
        return query.OrderByDescending(x => x.FechaHoraApertura);
    }

    private TurnoCajaEntity MapToNewEntity(
        CreateTurnoCajaRequest request)
    {
        var entity = TurnoCajaMapper.ToEntity(request);
        Normalizar(entity, request);
        return entity;
    }

    private void MapToExistingEntity(
        UpdateTurnoCajaRequest request,
        TurnoCajaEntity entity)
    {
        TurnoCajaMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);
    }

    private static TurnoCajaResponse MapToResponse(
        TurnoCajaEntity entity)
    {
        return new TurnoCajaResponse
        {
            Id = entity.Id,
            Caja = MapCajaInfo(entity.Caja),
            Empleado = MapEmpleadoInfo(entity.Empleado),
            FechaHoraApertura = entity.FechaHoraApertura,
            FechaHoraCierre = entity.FechaHoraCierre,
            Estado = entity.Estado,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static IReadOnlyCollection<TurnoCajaResponse>
        MapToResponseList(IEnumerable<TurnoCajaEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    private IQueryable<TurnoCajaEntity> ApplySearch(
        IQueryable<TurnoCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Caja.Codigo.Contains(search) ||
            x.Caja.Nombre.Contains(search) ||
            x.Empleado.Persona.Nombres.Contains(search) ||
            x.Empleado.Persona.ApellidoPaterno.Contains(search));
    }

    private async Task ValidarFksAsync(
        int cajaId,
        int empleadoId,
        CancellationToken cancellationToken)
    {
        var existeCaja = await DbContext.Set<CajaEntity>()
            .AnyAsync(
                x => x.Id == cajaId && x.Activo,
                cancellationToken);

        if (!existeCaja)
            throw new NotFoundException("Caja", cajaId);

        var existeEmpleado = await DbContext.Set<EmpleadoEntity>()
            .AnyAsync(
                x => x.Id == empleadoId && x.Activo,
                cancellationToken);

        if (!existeEmpleado)
            throw new NotFoundException("Empleado", empleadoId);
    }

    private async Task ValidarUnicoAbiertoAsync(
        int cajaId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existeAbierto = excludeId is null
            ? await Entities.AnyAsync(
                x => x.CajaId == cajaId
                     && x.Estado == EstadoTurnoCaja.Abierto,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.CajaId == cajaId
                     && x.Estado == EstadoTurnoCaja.Abierto
                     && x.Id != excludeId,
                cancellationToken);

        if (existeAbierto)
        {
            throw new ConflictException(
                "La caja ya tiene un turno abierto. " +
                "Cierre el turno vigente antes de abrir uno nuevo.");
        }
    }

    private async Task CargarNavegacionesAsync(
        TurnoCajaEntity entity,
        CancellationToken cancellationToken)
    {
        await DbContext.Entry(entity)
            .Reference(x => x.Caja).LoadAsync(cancellationToken);
        await DbContext.Entry(entity)
            .Reference(x => x.Empleado).LoadAsync(cancellationToken);
        await DbContext.Entry(entity.Empleado)
            .Reference(x => x.Persona).LoadAsync(cancellationToken);
    }

    private static void Normalizar(
        TurnoCajaEntity entity,
        TurnoCajaRequest request)
    {
        if (request.FechaHoraCierre.HasValue)
            entity.Estado = EstadoTurnoCaja.Cerrado;
    }

    private static CajaInfo? MapCajaInfo(CajaEntity? caja)
    {
        if (caja is null)
            return null;

        return new CajaInfo
        {
            Id = caja.Id,
            Codigo = caja.Codigo,
            Nombre = caja.Nombre
        };
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

    private static NotFoundException CreateNotFoundException(int id)
    {
        return new NotFoundException(typeof(TurnoCajaEntity).Name, id);
    }
}
