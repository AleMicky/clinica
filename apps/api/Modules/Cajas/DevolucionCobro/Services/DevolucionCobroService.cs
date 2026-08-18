using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Cajas.DevolucionCobro.Dtos;
using Clinica.Api.Modules.Cajas.DevolucionCobro.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;
using DevolucionCobroEntity = Clinica.Api.Modules.Cajas.DevolucionCobro.Entity.DevolucionCobro;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Services;

public sealed class DevolucionCobroService(
    AppDbContext dbContext,
    CorrelativoService correlativoService
)
{
    private AppDbContext DbContext { get; } = dbContext;

    private DbSet<DevolucionCobroEntity> Entities =>
        DbContext.Set<DevolucionCobroEntity>();

    public async Task<PagedResult<DevolucionCobroResponse>> ListarAsync(
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

        return new PagedResult<DevolucionCobroResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<DevolucionCobroResponse> ObtenerAsync(
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

    public async Task<DevolucionCobroResponse> CrearAsync(
        CreateDevolucionCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarFksAsync(
            request.CobroId,
            request.TurnoCajaId,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await using var tx = await DbContext.Database
            .BeginTransactionAsync(cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "DEV",
                Gestion = entity.FechaHora.Year,
                Prefijo = "DEV",
                Longitud = 6
            },
            cancellationToken);

        entity.Numero = correlativo.NumeroFormateado;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<DevolucionCobroResponse> ActualizarAsync(
        int id,
        UpdateDevolucionCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidarFksAsync(
            request.CobroId,
            request.TurnoCajaId,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
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

    private IQueryable<DevolucionCobroEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.Cobro)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona);
    }

    private IQueryable<DevolucionCobroEntity> ApplyOrder(
        IQueryable<DevolucionCobroEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    private DevolucionCobroEntity MapToNewEntity(
        CreateDevolucionCobroRequest request)
    {
        var entity = DevolucionCobroMapper.ToEntity(request);
        Normalizar(entity);
        return entity;
    }

    private void MapToExistingEntity(
        UpdateDevolucionCobroRequest request,
        DevolucionCobroEntity entity)
    {
        DevolucionCobroMapper.UpdateEntity(request, entity);
        Normalizar(entity);
    }

    private static DevolucionCobroResponse MapToResponse(
        DevolucionCobroEntity entity)
    {
        return new DevolucionCobroResponse
        {
            Id = entity.Id,
            Numero = entity.Numero,
            Cobro = MapCobroInfo(entity.Cobro),
            TurnoCaja = MapTurnoCajaInfo(entity.TurnoCaja),
            FechaHora = entity.FechaHora,
            Monto = entity.Monto,
            Motivo = entity.Motivo,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static IReadOnlyCollection<DevolucionCobroResponse>
        MapToResponseList(IEnumerable<DevolucionCobroEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    private IQueryable<DevolucionCobroEntity> ApplySearch(
        IQueryable<DevolucionCobroEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Numero.Contains(search) ||
            x.Motivo.Contains(search));
    }

    private async Task ValidarFksAsync(
        int cobroId,
        int turnoCajaId,
        CancellationToken cancellationToken)
    {
        var existeCobro = await DbContext.Set<CobroEntity>()
            .AnyAsync(
                x => x.Id == cobroId && x.Activo,
                cancellationToken);

        if (!existeCobro)
            throw new NotFoundException("Cobro", cobroId);

        var existeTurno = await DbContext.Set<TurnoCajaEntity>()
            .AnyAsync(
                x => x.Id == turnoCajaId && x.Activo,
                cancellationToken);

        if (!existeTurno)
            throw new NotFoundException("TurnoCaja", turnoCajaId);
    }

    private static void Normalizar(DevolucionCobroEntity entity)
    {
        entity.Motivo = entity.Motivo.Trim();
    }

    private static CobroInfo? MapCobroInfo(CobroEntity? cobro)
    {
        if (cobro is null)
            return null;

        return new CobroInfo
        {
            Id = cobro.Id,
            Numero = cobro.Numero,
            FechaHora = cobro.FechaHora,
            Total = cobro.Total,
            Estado = cobro.Estado
        };
    }

    private static TurnoCajaInfo? MapTurnoCajaInfo(TurnoCajaEntity? turno)
    {
        if (turno is null)
            return null;

        return new TurnoCajaInfo
        {
            Id = turno.Id,
            Caja = MapCajaInfo(turno.Caja),
            Empleado = MapEmpleadoInfo(turno.Empleado),
            FechaHoraApertura = turno.FechaHoraApertura,
            FechaHoraCierre = turno.FechaHoraCierre,
            Estado = turno.Estado
        };
    }

    private static CajaInfo? MapCajaInfo(
        Clinica.Api.Modules.Cajas.Caja.Entity.Caja? caja)
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

    private static EmpleadoInfo? MapEmpleadoInfo(
        Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado? empleado)
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
        return new NotFoundException(typeof(DevolucionCobroEntity).Name, id);
    }
}
