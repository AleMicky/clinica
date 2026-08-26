using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using MovimientoCajaEntity =
    Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja;
using TurnoCajaEntity =
    Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Services;

public sealed class MovimientoCajaService(
    AppDbContext dbContext)
{
    private AppDbContext DbContext { get; } = dbContext;

    private DbSet<MovimientoCajaEntity> Entities =>
        DbContext.Set<MovimientoCajaEntity>();

    // ============================================================
    // LISTAR
    // ============================================================

    public async Task<PagedResult<MovimientoCajaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        int? turnoCajaId = null,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (turnoCajaId.HasValue)
        {
            query = query.Where(
                x => x.TurnoCajaId == turnoCajaId.Value);
        }

        var normalizedSearch =
            string.IsNullOrWhiteSpace(search)
                ? null
                : search.Trim();

        query = ApplySearch(
            query,
            normalizedSearch);

        var totalItems =
            await query.CountAsync(cancellationToken);

        var offset =
            (pagination.ValidPage - 1) *
            pagination.ValidPageSize;

        var entities = await ApplyOrder(query)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<MovimientoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    // ============================================================
    // OBTENER
    // ============================================================

    public async Task<MovimientoCajaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == id &&
                    x.Activo,
                cancellationToken);

        if (entity is null)
        {
            throw CreateNotFoundException(id);
        }

        return MapToResponse(entity);
    }

    // ============================================================
    // REGISTRAR
    // ============================================================

    public async Task<MovimientoCajaResponse> RegistrarAsync(
        RegistrarMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var turno = await ObtenerTurnoAsync(
            request.TurnoCajaId,
            cancellationToken);

        if (turno.Estado != EstadoTurnoCaja.Abierto)
        {
            throw new ConflictException(
                "No se pueden registrar movimientos en un turno de caja cerrado.");
        }

        var moneda = await ObtenerMonedaAsync(
            request.MonedaId,
            cancellationToken);

        ValidarTipoCambio(
            moneda,
            request.TipoCambio);

        var entity =
            MovimientoCajaMapper.ToEntity(request);

        entity.FechaHora =
            DateTime.UtcNow;

        entity.Monto =
            Redondear(request.Monto);

        entity.TipoCambio =
            NormalizarTipoCambio(
                moneda,
                request.TipoCambio);

        entity.MontoMonedaBase =
            CalcularMontoMonedaBase(
                entity.Monto,
                entity.TipoCambio);

        entity.Concepto =
            request.Concepto.Trim();

        entity.Referencia =
            NormalizarOpcional(
                request.Referencia);

        entity.Observacion =
            NormalizarOpcional(
                request.Observacion);

        entity.Activo =
            true;

        await Entities.AddAsync(
            entity,
            cancellationToken);

        await DbContext.SaveChangesAsync(
            cancellationToken);

        return await ObtenerAsync(
            entity.Id,
            cancellationToken);
    }

    // ============================================================
    // OBTENER TURNO
    // ============================================================

    private async Task<TurnoCajaEntity> ObtenerTurnoAsync(
        int turnoCajaId,
        CancellationToken cancellationToken)
    {
        var turno = await DbContext
            .Set<TurnoCajaEntity>()
            .AsNoTracking()
            .Include(x => x.Caja)
            .Include(x => x.Empleado)
                .ThenInclude(x => x.Persona)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == turnoCajaId &&
                    x.Activo,
                cancellationToken);

        if (turno is null)
        {
            throw new NotFoundException(
                "TurnoCaja",
                turnoCajaId);
        }

        return turno;
    }

    // ============================================================
    // OBTENER MONEDA
    // ============================================================

    private async Task<Moneda> ObtenerMonedaAsync(
        int monedaId,
        CancellationToken cancellationToken)
    {
        var moneda = await DbContext
            .Set<Moneda>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == monedaId &&
                    x.Activo,
                cancellationToken);

        if (moneda is null)
        {
            throw new NotFoundException(
                "Moneda",
                monedaId);
        }

        return moneda;
    }

    // ============================================================
    // VALIDAR TIPO DE CAMBIO
    // ============================================================

    private static void ValidarTipoCambio(
        Moneda moneda,
        decimal tipoCambio)
    {
        if (tipoCambio <= 0)
        {
            throw new ConflictException(
                "El tipo de cambio debe ser mayor que cero.");
        }

        if (moneda.EsBase &&
            tipoCambio != 1m)
        {
            throw new ConflictException(
                "La moneda base debe utilizar un tipo de cambio igual a 1.");
        }
    }

    // ============================================================
    // NORMALIZAR TIPO CAMBIO
    // ============================================================

    private static decimal NormalizarTipoCambio(
        Moneda moneda,
        decimal tipoCambio)
    {
        if (moneda.EsBase)
            return 1m;

        return decimal.Round(
            tipoCambio,
            6,
            MidpointRounding.AwayFromZero);
    }

    // ============================================================
    // MONTO MONEDA BASE
    // ============================================================

    private static decimal CalcularMontoMonedaBase(
        decimal monto,
        decimal tipoCambio)
    {
        return Redondear(
            monto * tipoCambio);
    }

    // ============================================================
    // BUILD QUERY
    // ============================================================

    private IQueryable<MovimientoCajaEntity> BuildQuery()
    {
        return Entities

            .Include(x => x.TurnoCaja)
                .ThenInclude(x => x.Caja)

            .Include(x => x.TurnoCaja)
                .ThenInclude(x => x.Empleado)
                .ThenInclude(x => x.Persona)

            .Include(x => x.Moneda);
    }

    // ============================================================
    // ORDER
    // ============================================================

    private static IQueryable<MovimientoCajaEntity> ApplyOrder(
        IQueryable<MovimientoCajaEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    // ============================================================
    // SEARCH
    // ============================================================

    private static IQueryable<MovimientoCajaEntity> ApplySearch(
        IQueryable<MovimientoCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Concepto.Contains(search) ||

            (
                x.Referencia != null &&
                x.Referencia.Contains(search)
            ) ||

            (
                x.Observacion != null &&
                x.Observacion.Contains(search)
            ) ||

            x.TurnoCaja.Caja.Codigo.Contains(search) ||

            x.TurnoCaja.Caja.Nombre.Contains(search) ||

            x.Moneda.Codigo.Contains(search) ||

            x.Moneda.Nombre.Contains(search));
    }

    // ============================================================
    // MAP RESPONSE
    // ============================================================

    private static MovimientoCajaResponse MapToResponse(
        MovimientoCajaEntity entity)
    {
        return new MovimientoCajaResponse
        {
            Id =
                entity.Id,

            TurnoCaja =
                MapTurnoCajaInfo(
                    entity.TurnoCaja),

            Tipo =
                entity.Tipo,

            FechaHora =
                entity.FechaHora,

            MonedaId =
                entity.MonedaId,

            Moneda =
                MapMonedaInfo(
                    entity.Moneda),

            Monto =
                entity.Monto,

            TipoCambio =
                entity.TipoCambio,

            MontoMonedaBase =
                entity.MontoMonedaBase,

            Concepto =
                entity.Concepto,

            Referencia =
                entity.Referencia,

            Observacion =
                entity.Observacion,

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

    // ============================================================
    // MAP RESPONSE LIST
    // ============================================================

    private static IReadOnlyCollection<MovimientoCajaResponse>
        MapToResponseList(
            IEnumerable<MovimientoCajaEntity> entities)
    {
        return entities
            .Select(MapToResponse)
            .ToList();
    }

    // ============================================================
    // MAP TURNO
    // ============================================================

    private static TurnoCajaInfo? MapTurnoCajaInfo(
        TurnoCajaEntity? turno)
    {
        if (turno is null)
            return null;

        return new TurnoCajaInfo
        {
            Id =
                turno.Id,

            Caja =
                MapCajaInfo(
                    turno.Caja),

            Empleado =
                MapEmpleadoInfo(
                    turno.Empleado),

            FechaHoraApertura =
                turno.FechaHoraApertura,

            MontoInicial =
                turno.MontoInicial,

            ObservacionApertura =
                turno.ObservacionApertura,

            FechaHoraCierre =
                turno.FechaHoraCierre,

            ObservacionCierre =
                turno.ObservacionCierre,

            Estado =
                turno.Estado
        };
    }

    // ============================================================
    // MAP CAJA
    // ============================================================

    private static CajaInfo? MapCajaInfo(
        Clinica.Api.Modules.Cajas.Caja.Entity.Caja? caja)
    {
        if (caja is null)
            return null;

        return new CajaInfo
        {
            Id =
                caja.Id,

            Codigo =
                caja.Codigo,

            Nombre =
                caja.Nombre
        };
    }

    // ============================================================
    // MAP EMPLEADO
    // ============================================================

    private static EmpleadoInfo? MapEmpleadoInfo(
        Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado?
            empleado)
    {
        if (empleado is null)
            return null;

        var nombreCompleto =
            string.Join(
                " ",
                new[]
                {
                    empleado.Persona?.Nombres,
                    empleado.Persona?.ApellidoPaterno,
                    empleado.Persona?.ApellidoMaterno
                }
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x)));

        return new EmpleadoInfo
        {
            Id =
                empleado.Id,

            CodigoEmpleado =
                empleado.CodigoEmpleado,

            NombreCompleto =
                nombreCompleto
        };
    }

    // ============================================================
    // MAP MONEDA
    // ============================================================

    private static MonedaInfo MapMonedaInfo(
        Moneda moneda)
    {
        return new MonedaInfo
        {
            Id =
                moneda.Id,

            Codigo =
                moneda.Codigo,

            Nombre =
                moneda.Nombre,

            Simbolo =
                moneda.Simbolo
        };
    }

    // ============================================================
    // NORMALIZAR STRING
    // ============================================================

    private static string? NormalizarOpcional(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    // ============================================================
    // REDONDEAR
    // ============================================================

    private static decimal Redondear(
        decimal value)
    {
        return decimal.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }

    // ============================================================
    // NOT FOUND
    // ============================================================

    private static NotFoundException CreateNotFoundException(
        int id)
    {
        return new NotFoundException(
            "MovimientoCaja",
            id);
    }
}