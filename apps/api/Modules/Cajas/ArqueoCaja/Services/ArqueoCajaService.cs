using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Entity;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Mappers;
using Clinica.Api.Modules.Cajas.Cobro.Enums;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using ArqueoCajaEntity = Clinica.Api.Modules.Cajas.ArqueoCaja.Entity.ArqueoCaja;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Services;

public sealed class ArqueoCajaService(AppDbContext dbContext)
{
    private AppDbContext DbContext { get; } = dbContext;

    private DbSet<ArqueoCajaEntity> Entities =>
        DbContext.Set<ArqueoCajaEntity>();

    // ============================================================
    // LISTAR
    // ============================================================

    public async Task<PagedResult<ArqueoCajaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

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

        return new PagedResult<ArqueoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    // ============================================================
    // OBTENER
    // ============================================================

    public async Task<ArqueoCajaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity);
    }

    // ============================================================
    // RESUMEN PREVIO
    // ============================================================

    public async Task<ArqueoCajaResumenResponse> ObtenerResumenAsync(
        int turnoCajaId,
        CancellationToken cancellationToken = default)
    {
        var turno = await ObtenerTurnoAsync(
            turnoCajaId,
            cancellationToken);

        if (turno.Estado != EstadoTurnoCaja.Abierto)
        {
            throw new ConflictException(
                "Solo se puede consultar el arqueo de un turno abierto.");
        }

        var detallesCobro = await DbContext
            .Set<CobroEntity>()
            .AsNoTracking()
            .Where(x =>
                x.TurnoCajaId == turno.Id &&
                x.Activo &&
                x.Estado == EstadoCobro.Confirmado)
            .SelectMany(x => x.Detalles)
            .Where(x => x.Activo)
            .Select(x => new
            {
                x.MetodoPagoId,
                MetodoPagoNombre = x.MetodoPago.Nombre,
                MetodoPagoCodigo = x.MetodoPago.Codigo,

                x.MonedaId,
                MonedaNombre = x.Moneda.Nombre,
                MonedaSimbolo = x.Moneda.Simbolo,

                x.MontoMonedaBase
            })
            .ToListAsync(cancellationToken);

        var detalles = detallesCobro
            .GroupBy(x => new
            {
                x.MetodoPagoId,
                x.MetodoPagoNombre,
                x.MetodoPagoCodigo,
                x.MonedaId,
                x.MonedaNombre,
                x.MonedaSimbolo
            })
            .Select(x =>
                new ArqueoCajaResumenDetalleResponse
                {
                    MetodoPagoId =
                        x.Key.MetodoPagoId,

                    MetodoPagoNombre =
                        x.Key.MetodoPagoNombre,

                    MonedaId =
                        x.Key.MonedaId,

                    MonedaNombre =
                        x.Key.MonedaNombre,

                    MonedaSimbolo =
                        x.Key.MonedaSimbolo,

                    MontoEsperado =
                        Redondear(
                            x.Sum(d => d.MontoMonedaBase))
                })
            .ToList();

        var metodoEfectivo = await DbContext
            .Set<MetodoPago>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Codigo == "EFECTIVO" &&
                    x.Activo,
                cancellationToken);

        var monedaBase = await DbContext
            .Set<Moneda>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.EsBase &&
                    x.Activo,
                cancellationToken);

        if (metodoEfectivo is not null &&
            monedaBase is not null)
        {
            var efectivo = detalles
                .FirstOrDefault(x =>
                    x.MetodoPagoId == metodoEfectivo.Id &&
                    x.MonedaId == monedaBase.Id);

            if (efectivo is not null)
            {
                detalles.Remove(efectivo);

                detalles.Add(
                    efectivo with
                    {
                        MontoEsperado =
                            Redondear(
                                efectivo.MontoEsperado +
                                turno.MontoInicial)
                    });
            }
            else
            {
                detalles.Add(
                    new ArqueoCajaResumenDetalleResponse
                    {
                        MetodoPagoId =
                            metodoEfectivo.Id,

                        MetodoPagoNombre =
                            metodoEfectivo.Nombre,

                        MonedaId =
                            monedaBase.Id,

                        MonedaNombre =
                            monedaBase.Nombre,

                        MonedaSimbolo =
                            monedaBase.Simbolo,

                        MontoEsperado =
                            Redondear(turno.MontoInicial)
                    });
            }
        }

        detalles = detalles
            .OrderBy(x => x.MetodoPagoNombre)
            .ThenBy(x => x.MonedaNombre)
            .ToList();

        return new ArqueoCajaResumenResponse
        {
            TurnoCajaId =
                turno.Id,

            TotalEsperado =
                Redondear(
                    detalles.Sum(x => x.MontoEsperado)),

            Detalles =
                detalles
        };
    }

    // ============================================================
    // REGISTRAR
    // ============================================================

    public async Task<ArqueoCajaResponse> RegistrarAsync(
        RegistrarArqueoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var turno = await ObtenerTurnoAsync(
            request.TurnoCajaId,
            cancellationToken);

        if (turno.Estado != EstadoTurnoCaja.Abierto)
        {
            throw new ConflictException(
                "Solo se puede registrar un arqueo de un turno abierto.");
        }

        var existeArqueo = await Entities
            .AnyAsync(
                x =>
                    x.TurnoCajaId == turno.Id &&
                    x.Activo,
                cancellationToken);

        if (existeArqueo)
        {
            throw new ConflictException(
                "El turno de caja ya tiene un arqueo registrado.");
        }

        if (request.Detalles.Count == 0)
        {
            throw new ConflictException(
                "Debe registrar al menos un detalle de arqueo.");
        }

        ValidarDetallesDuplicados(
            request.Detalles);

        await ValidarMetodosPagoAsync(
            request.Detalles,
            cancellationToken);

        await ValidarMonedasAsync(
            request.Detalles,
            cancellationToken);

        var resumen =
            await ObtenerResumenAsync(
                turno.Id,
                cancellationToken);

        ValidarDetallesContraResumen(
            request.Detalles,
            resumen.Detalles);

        var entity =
            ArqueoCajaMapper.ToEntity(request);

        entity.FechaHora =
            DateTime.UtcNow;

        entity.Activo =
            true;

        entity.Observacion =
            NormalizarOpcional(
                request.Observacion);

        entity.Detalles = request.Detalles
            .Select(requestDetalle =>
            {
                var esperado = resumen.Detalles
                    .First(x =>
                        x.MetodoPagoId ==
                        requestDetalle.MetodoPagoId &&

                        x.MonedaId ==
                        requestDetalle.MonedaId);

                var montoEsperado =
                    Redondear(esperado.MontoEsperado);

                var montoContado =
                    Redondear(requestDetalle.MontoContado);

                return new DetalleArqueoCaja
                {
                    MetodoPagoId =
                        requestDetalle.MetodoPagoId,

                    MonedaId =
                        requestDetalle.MonedaId,

                    MontoEsperado =
                        montoEsperado,

                    MontoContado =
                        montoContado,

                    Diferencia =
                        Redondear(
                            montoContado -
                            montoEsperado),

                    Activo =
                        true
                };
            })
            .ToList();

        CalcularTotales(entity);

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
    // VALIDAR DETALLES VS RESUMEN
    // ============================================================

    private static void ValidarDetallesContraResumen(
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles,
        IReadOnlyCollection<ArqueoCajaResumenDetalleResponse> resumen)
    {
        var esperados = resumen
            .Select(x => new DetalleKey(
                x.MetodoPagoId,
                x.MonedaId))
            .ToHashSet();

        var enviados = detalles
            .Select(x => new DetalleKey(
                x.MetodoPagoId,
                x.MonedaId))
            .ToHashSet();

        var faltantes = esperados
            .Except(enviados)
            .ToList();

        if (faltantes.Count > 0)
        {
            throw new ConflictException(
                "Debe registrar el monto contado de todos los métodos de pago del arqueo.");
        }

        var adicionales = enviados
            .Except(esperados)
            .ToList();

        if (adicionales.Count > 0)
        {
            throw new ConflictException(
                "El arqueo contiene métodos de pago o monedas que no corresponden al turno.");
        }
    }

    // ============================================================
    // CALCULAR TOTALES
    // ============================================================

    private static void CalcularTotales(
        ArqueoCajaEntity entity)
    {
        var detalles = entity.Detalles
            .Where(x => x.Activo)
            .ToList();

        entity.TotalEsperado =
            Redondear(
                detalles.Sum(x => x.MontoEsperado));

        entity.TotalContado =
            Redondear(
                detalles.Sum(x => x.MontoContado));

        entity.Diferencia =
            Redondear(
                entity.TotalContado -
                entity.TotalEsperado);
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
    // VALIDAR MÉTODOS PAGO
    // ============================================================

    private async Task ValidarMetodosPagoAsync(
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Select(x => x.MetodoPagoId)
            .Distinct()
            .ToList();

        var existentes = await DbContext
            .Set<MetodoPago>()
            .AsNoTracking()
            .Where(x =>
                ids.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltante = ids
            .Except(existentes)
            .FirstOrDefault();

        if (faltante != default)
        {
            throw new NotFoundException(
                "MetodoPago",
                faltante);
        }
    }

    // ============================================================
    // VALIDAR MONEDAS
    // ============================================================

    private async Task ValidarMonedasAsync(
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Select(x => x.MonedaId)
            .Distinct()
            .ToList();

        var existentes = await DbContext
            .Set<Moneda>()
            .AsNoTracking()
            .Where(x =>
                ids.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltante = ids
            .Except(existentes)
            .FirstOrDefault();

        if (faltante != default)
        {
            throw new NotFoundException(
                "Moneda",
                faltante);
        }
    }

    // ============================================================
    // DUPLICADOS
    // ============================================================

    private static void ValidarDetallesDuplicados(
        IReadOnlyCollection<ArqueoCajaDetalleRequest> detalles)
    {
        var duplicado = detalles
            .GroupBy(x => new
            {
                x.MetodoPagoId,
                x.MonedaId
            })
            .FirstOrDefault(x => x.Count() > 1);

        if (duplicado is not null)
        {
            throw new ConflictException(
                "No puede registrar dos detalles con el mismo método de pago y moneda.");
        }
    }

    // ============================================================
    // QUERY
    // ============================================================

    private IQueryable<ArqueoCajaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja)
                .ThenInclude(x => x.Caja)

            .Include(x => x.TurnoCaja)
                .ThenInclude(x => x.Empleado)
                .ThenInclude(x => x.Persona)

            .Include(x => x.Detalles)
                .ThenInclude(x => x.MetodoPago)

            .Include(x => x.Detalles)
                .ThenInclude(x => x.Moneda);
    }

    // ============================================================
    // ORDER
    // ============================================================

    private static IQueryable<ArqueoCajaEntity> ApplyOrder(
        IQueryable<ArqueoCajaEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    // ============================================================
    // SEARCH
    // ============================================================

    private static IQueryable<ArqueoCajaEntity> ApplySearch(
        IQueryable<ArqueoCajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.TurnoCaja.Caja.Codigo.Contains(search) ||
            x.TurnoCaja.Caja.Nombre.Contains(search) ||
            (
                x.Observacion != null &&
                x.Observacion.Contains(search)
            ));
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    private static ArqueoCajaResponse MapToResponse(
        ArqueoCajaEntity entity)
    {
        return new ArqueoCajaResponse
        {
            Id = entity.Id,

            TurnoCaja =
                MapTurnoCajaInfo(entity.TurnoCaja),

            FechaHora =
                entity.FechaHora,

            TotalEsperado =
                entity.TotalEsperado,

            TotalContado =
                entity.TotalContado,

            Diferencia =
                entity.Diferencia,

            Observacion =
                entity.Observacion,

            Detalles =
                MapDetalles(
                    entity.Detalles
                        .Where(x => x.Activo)),

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

    private static IReadOnlyCollection<ArqueoCajaResponse>
        MapToResponseList(
            IEnumerable<ArqueoCajaEntity> entities)
    {
        return entities
            .Select(MapToResponse)
            .ToList();
    }

    // ============================================================
    // DETALLES RESPONSE
    // ============================================================

    private static IReadOnlyCollection<ArqueoCajaDetalleResponse>
        MapDetalles(
            IEnumerable<DetalleArqueoCaja> detalles)
    {
        return detalles
            .Select(x =>
                new ArqueoCajaDetalleResponse
                {
                    Id =
                        x.Id,

                    ArqueoCajaId =
                        x.ArqueoCajaId,

                    MetodoPagoId =
                        x.MetodoPagoId,

                    MetodoPago =
                        new MetodoPagoInfo
                        {
                            Id =
                                x.MetodoPago.Id,

                            Codigo =
                                x.MetodoPago.Codigo,

                            Nombre =
                                x.MetodoPago.Nombre
                        },

                    MonedaId =
                        x.MonedaId,

                    Moneda =
                        new MonedaInfo
                        {
                            Id =
                                x.Moneda.Id,

                            Codigo =
                                x.Moneda.Codigo,

                            Nombre =
                                x.Moneda.Nombre,

                            Simbolo =
                                x.Moneda.Simbolo
                        },

                    MontoEsperado =
                        x.MontoEsperado,

                    MontoContado =
                        x.MontoContado,

                    Diferencia =
                        x.Diferencia,

                    Activo =
                        x.Activo,

                    FechaCreacion =
                        x.FechaCreacion,

                    FechaModificacion =
                        x.FechaModificacion,

                    CreadoPor =
                        x.CreadoPor,

                    ModificadoPor =
                        x.ModificadoPor
                })
            .ToList();
    }

    // ============================================================
    // TURNO
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
                MapCajaInfo(turno.Caja),

            Empleado =
                MapEmpleadoInfo(turno.Empleado),

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
            Id = empleado.Id,
            CodigoEmpleado = empleado.CodigoEmpleado,
            NombreCompleto = nombreCompleto
        };
    }

    private static string? NormalizarOpcional(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static decimal Redondear(
        decimal value)
    {
        return decimal.Round(
            value,
            2,
            MidpointRounding.AwayFromZero);
    }

    private static NotFoundException CreateNotFoundException(
        int id)
    {
        return new NotFoundException(
            "ArqueoCaja",
            id);
    }

    private readonly record struct DetalleKey(
        int MetodoPagoId,
        int MonedaId);
}