using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using MovimientoCajaEntity = Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Services;

public sealed class MovimientoCajaService(AppDbContext dbContext)
    : CrudService<
        MovimientoCajaEntity,
        CreateMovimientoCajaRequest,
        UpdateMovimientoCajaRequest,
        MovimientoCajaResponse
    >(dbContext)
{
    public override async Task<MovimientoCajaResponse> CrearAsync(
        CreateMovimientoCajaRequest request,
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

    public override async Task<MovimientoCajaResponse> ActualizarAsync(
        int id,
        UpdateMovimientoCajaRequest request,
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

    protected override IQueryable<MovimientoCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona);
    }

    protected override IQueryable<MovimientoCajaEntity> ApplyOrder(
        IQueryable<MovimientoCajaEntity> query)
    {
        return query.OrderByDescending(x => x.FechaHora);
    }

    protected override MovimientoCajaEntity MapToNewEntity(
        CreateMovimientoCajaRequest request)
    {
        var entity = MovimientoCajaMapper.ToEntity(request);
        Normalizar(entity);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateMovimientoCajaRequest request,
        MovimientoCajaEntity entity)
    {
        MovimientoCajaMapper.UpdateEntity(request, entity);
        Normalizar(entity);
    }

    protected override MovimientoCajaResponse MapToResponse(
        MovimientoCajaEntity entity)
    {
        return new MovimientoCajaResponse
        {
            Id = entity.Id,
            TurnoCaja = MapTurnoCajaInfo(entity.TurnoCaja),
            Tipo = entity.Tipo,
            FechaHora = entity.FechaHora,
            Monto = entity.Monto,
            Concepto = entity.Concepto,
            Referencia = entity.Referencia,
            Observacion = entity.Observacion,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    protected override IReadOnlyCollection<MovimientoCajaResponse>
        MapToResponseList(IEnumerable<MovimientoCajaEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    protected override IQueryable<MovimientoCajaEntity> ApplySearch(
        IQueryable<MovimientoCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Concepto.Contains(search) ||
            x.Referencia != null && x.Referencia.Contains(search) ||
            x.TurnoCaja.Caja.Codigo.Contains(search) ||
            x.TurnoCaja.Caja.Nombre.Contains(search));
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
        MovimientoCajaEntity entity,
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

    private static void Normalizar(MovimientoCajaEntity entity)
    {
        entity.Concepto = entity.Concepto.Trim();
        entity.Referencia = string.IsNullOrWhiteSpace(entity.Referencia)
            ? null
            : entity.Referencia.Trim();
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