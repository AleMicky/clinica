using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.CierreCaja.Dtos;
using Clinica.Api.Modules.Cajas.CierreCaja.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;
using CierreCajaEntity = Clinica.Api.Modules.Cajas.CierreCaja.Entity.CierreCaja;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.CierreCaja.Services;

public sealed class CierreCajaService(AppDbContext dbContext)
    : CrudService<
        CierreCajaEntity,
        CreateCierreCajaRequest,
        UpdateCierreCajaRequest,
        CierreCajaResponse
    >(dbContext)
{
    public override async Task<CierreCajaResponse> CrearAsync(
        CreateCierreCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarFksAsync(
            request.TurnoCajaId,
            request.ArqueoCajaId,
            cancellationToken);

        await ValidarCierreUnicoAsync(
            request.TurnoCajaId,
            null,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<CierreCajaResponse> ActualizarAsync(
        int id,
        UpdateCierreCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidarFksAsync(
            request.TurnoCajaId,
            request.ArqueoCajaId,
            cancellationToken);

        await ValidarCierreUnicoAsync(
            request.TurnoCajaId,
            id,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<CierreCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.ArqueoCaja);
    }

    protected override IQueryable<CierreCajaEntity> ApplyOrder(
        IQueryable<CierreCajaEntity> query)
    {
        return query.OrderByDescending(x => x.FechaHora);
    }

    protected override CierreCajaEntity MapToNewEntity(
        CreateCierreCajaRequest request)
    {
        var entity = CierreCajaMapper.ToEntity(request);
        Normalizar(entity);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateCierreCajaRequest request,
        CierreCajaEntity entity)
    {
        CierreCajaMapper.UpdateEntity(request, entity);
        Normalizar(entity);
    }

    protected override CierreCajaResponse MapToResponse(
        CierreCajaEntity entity)
    {
        return new CierreCajaResponse
        {
            Id = entity.Id,
            TurnoCaja = MapTurnoCajaInfo(entity.TurnoCaja),
            ArqueoCaja = MapArqueoCajaInfo(entity.ArqueoCaja),
            FechaHora = entity.FechaHora,
            MontoApertura = entity.MontoApertura,
            TotalIngresos = entity.TotalIngresos,
            TotalEgresos = entity.TotalEgresos,
            TotalCobros = entity.TotalCobros,
            TotalEsperado = entity.TotalEsperado,
            TotalContado = entity.TotalContado,
            Diferencia = entity.Diferencia,
            Observacion = entity.Observacion,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    protected override IReadOnlyCollection<CierreCajaResponse>
        MapToResponseList(IEnumerable<CierreCajaEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    protected override IQueryable<CierreCajaEntity> ApplySearch(
        IQueryable<CierreCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.TurnoCaja.Caja.Codigo.Contains(search) ||
            x.TurnoCaja.Caja.Nombre.Contains(search) ||
            x.Observacion != null && x.Observacion.Contains(search));
    }

    private async Task ValidarFksAsync(
        int turnoCajaId,
        int arqueoCajaId,
        CancellationToken cancellationToken)
    {
        var existeTurno = await DbContext.Set<TurnoCajaEntity>()
            .AnyAsync(
                x => x.Id == turnoCajaId && x.Activo,
                cancellationToken);

        if (!existeTurno)
            throw new NotFoundException("TurnoCaja", turnoCajaId);

        var existeArqueo = await DbContext.Set<ArqueoCajaEntity>()
            .AnyAsync(
                x => x.Id == arqueoCajaId && x.Activo,
                cancellationToken);

        if (!existeArqueo)
            throw new NotFoundException("ArqueoCaja", arqueoCajaId);

        var arqueo = await DbContext.Set<ArqueoCajaEntity>()
            .FirstAsync(
                x => x.Id == arqueoCajaId,
                cancellationToken);

        if (arqueo.TurnoCajaId != turnoCajaId)
        {
            throw new ConflictException(
                "El arqueo no pertenece al turno indicado.");
        }
    }

    private async Task ValidarCierreUnicoAsync(
        int turnoCajaId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existe = excludeId is null
            ? await Entities.AnyAsync(
                x => x.TurnoCajaId == turnoCajaId,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.TurnoCajaId == turnoCajaId
                     && x.Id != excludeId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El turno ya tiene un cierre registrado.");
        }
    }

    private async Task CargarNavegacionesAsync(
        CierreCajaEntity entity,
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
        await DbContext.Entry(entity)
            .Reference(x => x.ArqueoCaja).LoadAsync(cancellationToken);
    }

    private static void Normalizar(CierreCajaEntity entity)
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

    private static ArqueoCajaInfo? MapArqueoCajaInfo(
        ArqueoCajaEntity? arqueo)
    {
        if (arqueo is null)
            return null;

        return new ArqueoCajaInfo
        {
            Id = arqueo.Id,
            FechaHora = arqueo.FechaHora,
            TotalEsperado = arqueo.TotalEsperado,
            TotalContado = arqueo.TotalContado,
            Diferencia = arqueo.Diferencia
        };
    }
}