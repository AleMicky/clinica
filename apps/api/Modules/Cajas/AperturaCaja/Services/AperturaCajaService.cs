using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.AperturaCaja.Dtos;
using Clinica.Api.Modules.Cajas.AperturaCaja.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using AperturaCajaEntity = Clinica.Api.Modules.Cajas.AperturaCaja.Entity.AperturaCaja;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.AperturaCaja.Services;

public sealed class AperturaCajaService(AppDbContext dbContext)
    : CrudService<
        AperturaCajaEntity,
        CreateAperturaCajaRequest,
        UpdateAperturaCajaRequest,
        AperturaCajaResponse
    >(dbContext)
{
    public override async Task<AperturaCajaResponse> CrearAsync(
        CreateAperturaCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarTurnoAsync(request.TurnoCajaId, cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<AperturaCajaResponse> ActualizarAsync(
        int id,
        UpdateAperturaCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidarTurnoAsync(request.TurnoCajaId, cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<AperturaCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona);
    }

    protected override IQueryable<AperturaCajaEntity> ApplyOrder(
        IQueryable<AperturaCajaEntity> query)
    {
        return query.OrderByDescending(x => x.FechaHora);
    }

    protected override AperturaCajaEntity MapToNewEntity(
        CreateAperturaCajaRequest request)
    {
        var entity = AperturaCajaMapper.ToEntity(request);
        Normalizar(entity);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateAperturaCajaRequest request,
        AperturaCajaEntity entity)
    {
        AperturaCajaMapper.UpdateEntity(request, entity);
        Normalizar(entity);
    }

    protected override AperturaCajaResponse MapToResponse(
        AperturaCajaEntity entity)
    {
        return new AperturaCajaResponse
        {
            Id = entity.Id,
            TurnoCaja = MapTurnoCajaInfo(entity.TurnoCaja),
            FechaHora = entity.FechaHora,
            MontoInicial = entity.MontoInicial,
            Observacion = entity.Observacion,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    protected override IReadOnlyCollection<AperturaCajaResponse>
        MapToResponseList(IEnumerable<AperturaCajaEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    protected override IQueryable<AperturaCajaEntity> ApplySearch(
        IQueryable<AperturaCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.TurnoCaja.Caja.Codigo.Contains(search) ||
            x.TurnoCaja.Caja.Nombre.Contains(search) ||
            x.Observacion != null && x.Observacion.Contains(search));
    }

    private async Task ValidarTurnoAsync(
        int turnoCajaId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Set<TurnoCajaEntity>()
            .AnyAsync(
                x => x.Id == turnoCajaId && x.Activo,
                cancellationToken);

        if (!existe)
            throw new NotFoundException("TurnoCaja", turnoCajaId);
    }

    private async Task CargarNavegacionesAsync(
        AperturaCajaEntity entity,
        CancellationToken cancellationToken)
    {
        await DbContext.Entry(entity)
            .Reference(x => x.TurnoCaja).LoadAsync(cancellationToken);
        await DbContext.Entry(entity.TurnoCaja)
            .Reference(x => x.Caja).LoadAsync(cancellationToken);
        await DbContext.Entry(entity.TurnoCaja)
            .Reference(x => x.Empleado).LoadAsync(cancellationToken);
        await DbContext.Entry(entity.TurnoCaja.Empleado)
            .Reference(x => x.Persona).LoadAsync(cancellationToken);
    }

    private static void Normalizar(AperturaCajaEntity entity)
    {
        entity.Observacion = string.IsNullOrWhiteSpace(entity.Observacion)
            ? null
            : entity.Observacion.Trim();
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
}