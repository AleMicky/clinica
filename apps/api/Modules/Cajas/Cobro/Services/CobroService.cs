using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Clinica.Api.Modules.Cajas.Cobro.Entity;
using Clinica.Api.Modules.Cajas.Cobro.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Parametros.Banco.Entity;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Cajas.Cobro.Services;

public sealed class CobroService(
    AppDbContext dbContext,
    CorrelativoService correlativoService
)
    : CrudService<
        CobroEntity,
        CreateCobroRequest,
        UpdateCobroRequest,
        CobroResponse
    >(dbContext)
{
    public override async Task<CobroResponse> ObtenerAsync(
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

        return MapToResponse(entity) with
        {
            Detalles = MapDetalles(
                entity.Detalles.Where(x => x.Activo))
        };
    }

    public override async Task<CobroResponse> CrearAsync(
        CreateCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarFksAsync(
            request.TurnoCajaId,
            request.VentaPagadorId,
            cancellationToken);

        await ValidarMetodosPagoAsync(
            request.Detalles,
            cancellationToken);

        await ValidarMonedasAsync(
            request.Detalles,
            cancellationToken);

        await ValidarCuentasBancariasAsync(
            request.Detalles,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await using var tx = await DbContext.Database
            .BeginTransactionAsync(cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "COB",
                Gestion = entity.FechaHora.Year,
                Prefijo = "COB",
                Longitud = 6
            },
            cancellationToken);

        entity.Numero = correlativo.NumeroFormateado;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public override async Task<CobroResponse> ActualizarAsync(
        int id,
        UpdateCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (entity.Estado != EstadoCobro.Registrado)
        {
            throw new ConflictException(
                $"No se puede editar un cobro en estado {entity.Estado}. " +
                $"Solo los cobros en estado {EstadoCobro.Registrado} pueden ser editados.");
        }

        await ValidarFksAsync(
            request.TurnoCajaId,
            request.VentaPagadorId,
            cancellationToken);

        await ValidarMetodosPagoAsync(
            request.Detalles,
            cancellationToken);

        await ValidarMonedasAsync(
            request.Detalles,
            cancellationToken);

        await ValidarCuentasBancariasAsync(
            request.Detalles,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public override async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        await AnularAsync(id, null, cancellationToken);
    }

    public async Task<CobroResponse> AnularAsync(
        int id,
        string? motivo,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (!entity.Activo)
        {
            throw new ConflictException(
                $"No se puede anular un cobro en estado {entity.Estado}.");
        }

        if (entity.Estado is EstadoCobro.Anulado
            or EstadoCobro.Devuelto
            or EstadoCobro.DevueltoParcial)
        {
            throw new ConflictException(
                $"No se puede anular un cobro en estado {entity.Estado}.");
        }

        entity.Estado = EstadoCobro.Anulado;
        entity.Activo = false;
        entity.MotivoAnulacion = string.IsNullOrWhiteSpace(motivo)
            ? null
            : motivo.Trim();
        entity.FechaHoraAnulacion = DateTime.UtcNow;

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<CobroEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.VentaPagador).ThenInclude(p => p.Venta)
            .Include(x => x.VentaPagador).ThenInclude(p => p.Convenio)
            .Include(x => x.Detalles);
    }

    protected override IQueryable<CobroEntity> ApplyOrder(
        IQueryable<CobroEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    protected override CobroEntity MapToNewEntity(
        CreateCobroRequest request)
    {
        var entity = CobroMapper.ToEntity(request);
        entity.Estado = EstadoCobro.Registrado;
        entity.Detalles = request.Detalles
            .Select(CrearDetalle)
            .ToList();
        CalcularTotal(entity);
        Normalizar(entity);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateCobroRequest request,
        CobroEntity entity)
    {
        CobroMapper.UpdateEntity(request, entity);
        ReemplazarDetalles(entity, request.Detalles);
        CalcularTotal(entity);
        Normalizar(entity);
    }

    protected override CobroResponse MapToResponse(
        CobroEntity entity)
    {
        return new CobroResponse
        {
            Id = entity.Id,
            Numero = entity.Numero,
            TurnoCaja = MapTurnoCajaInfo(entity.TurnoCaja),
            VentaPagador = MapVentaPagadorInfo(entity.VentaPagador),
            FechaHora = entity.FechaHora,
            Total = entity.Total,
            Estado = entity.Estado,
            Observacion = entity.Observacion,
            MotivoAnulacion = entity.MotivoAnulacion,
            FechaHoraAnulacion = entity.FechaHoraAnulacion,
            Detalles = MapDetalles(entity.Detalles.Where(x => x.Activo)),
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    protected override IReadOnlyCollection<CobroResponse>
        MapToResponseList(IEnumerable<CobroEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    protected override IQueryable<CobroEntity> ApplySearch(
        IQueryable<CobroEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x => x.Numero.Contains(search));
    }

    private async Task ValidarFksAsync(
        int turnoCajaId,
        int ventaPagadorId,
        CancellationToken cancellationToken)
    {
        var existeTurno = await DbContext.Set<TurnoCajaEntity>()
            .AnyAsync(
                x => x.Id == turnoCajaId && x.Activo,
                cancellationToken);

        if (!existeTurno)
            throw new NotFoundException("TurnoCaja", turnoCajaId);

        var existePagador = await DbContext.Set<VentaPagadorEntity>()
            .AnyAsync(
                x => x.Id == ventaPagadorId && x.Activo,
                cancellationToken);

        if (!existePagador)
            throw new NotFoundException("VentaPagador", ventaPagadorId);
    }

    private async Task ValidarMetodosPagoAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Select(x => x.MetodoPagoId)
            .Distinct()
            .ToList();

        var existentes = await DbContext.Set<MetodoPago>()
            .Where(x => ids.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var id in ids.Except(existentes))
            throw new NotFoundException("MetodoPago", id);
    }

    private async Task ValidarMonedasAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Select(x => x.MonedaId)
            .Distinct()
            .ToList();

        var existentes = await DbContext.Set<Moneda>()
            .Where(x => ids.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var id in ids.Except(existentes))
            throw new NotFoundException("Moneda", id);
    }

    private async Task ValidarCuentasBancariasAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ids = detalles
            .Where(x => x.CuentaBancariaId.HasValue)
            .Select(x => x.CuentaBancariaId!.Value)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return;

        var existentes = await DbContext.Set<CuentaBancaria>()
            .Where(x => ids.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var id in ids.Except(existentes))
            throw new NotFoundException("CuentaBancaria", id);
    }

    private static CobroDetalle CrearDetalle(
        CobroDetalleRequest request)
    {
        var montoMonedaBase = decimal.Round(
            request.Monto * request.TipoCambio,
            2,
            MidpointRounding.AwayFromZero);

        return new CobroDetalle
        {
            MetodoPagoId = request.MetodoPagoId,
            MonedaId = request.MonedaId,
            CuentaBancariaId = request.CuentaBancariaId,
            Monto = request.Monto,
            TipoCambio = request.TipoCambio,
            MontoMonedaBase = montoMonedaBase,
            Referencia = NormalizarOpcional(request.Referencia),
            EntidadFinanciera = NormalizarOpcional(request.EntidadFinanciera),
            Observacion = NormalizarOpcional(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        CobroEntity entity,
        IReadOnlyCollection<CobroDetalleRequest> detalles)
    {
        var existingByKey = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(ClaveDetalle);

        var incomingKeys = detalles
            .Select(ClaveDetalle)
            .ToHashSet();

        foreach (var existing in entity.Detalles
                     .Where(x => x.Activo && !incomingKeys.Contains(ClaveDetalle(x)))
                     .ToList())
        {
            entity.Detalles.Remove(existing);
        }

        foreach (var request in detalles)
        {
            if (existingByKey.TryGetValue(
                    ClaveDetalle(request),
                    out var detalle))
            {
                detalle.MetodoPagoId = request.MetodoPagoId;
                detalle.MonedaId = request.MonedaId;
                detalle.CuentaBancariaId = request.CuentaBancariaId;
                detalle.Monto = request.Monto;
                detalle.TipoCambio = request.TipoCambio;
                detalle.MontoMonedaBase = decimal.Round(
                    request.Monto * request.TipoCambio,
                    2,
                    MidpointRounding.AwayFromZero);
                detalle.Referencia = NormalizarOpcional(request.Referencia);
                detalle.EntidadFinanciera = NormalizarOpcional(request.EntidadFinanciera);
                detalle.Observacion = NormalizarOpcional(request.Observacion);
            }
            else
            {
                entity.Detalles.Add(CrearDetalle(request));
            }
        }
    }

    private static void CalcularTotal(CobroEntity entity)
    {
        entity.Total = entity.Detalles
            .Where(x => x.Activo)
            .Sum(x => x.MontoMonedaBase);
    }

    private static void Normalizar(CobroEntity entity)
    {
        entity.Observacion = NormalizarOpcional(entity.Observacion);
    }

    private static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static IReadOnlyCollection<CobroDetalleResponse> MapDetalles(
        IEnumerable<CobroDetalle> detalles)
    {
        return detalles
            .Select(d => new CobroDetalleResponse
            {
                Id = d.Id,
                CobroId = d.CobroId,
                MetodoPagoId = d.MetodoPagoId,
                MonedaId = d.MonedaId,
                CuentaBancariaId = d.CuentaBancariaId,
                Monto = d.Monto,
                TipoCambio = d.TipoCambio,
                MontoMonedaBase = d.MontoMonedaBase,
                Referencia = d.Referencia,
                EntidadFinanciera = d.EntidadFinanciera,
                Observacion = d.Observacion,
                Activo = d.Activo,
                FechaCreacion = d.FechaCreacion,
                FechaModificacion = d.FechaModificacion,
                CreadoPor = d.CreadoPor,
                ModificadoPor = d.ModificadoPor
            })
            .ToList();
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

    private static VentaPagadorInfo? MapVentaPagadorInfo(
        VentaPagadorEntity? pagador)
    {
        if (pagador is null)
            return null;

        return new VentaPagadorInfo
        {
            Id = pagador.Id,
            Tipo = pagador.Tipo,
            VentaId = pagador.VentaId,
            VentaNumero = pagador.Venta?.Numero ?? string.Empty,
            ConvenioId = pagador.ConvenioId,
            ConvenioNombre = pagador.Convenio?.Nombre,
            Monto = pagador.Monto,
            Estado = pagador.Estado
        };
    }

    private static DetalleKey ClaveDetalle(CobroDetalle d) =>
        new(d.MetodoPagoId, d.MonedaId, d.CuentaBancariaId);

    private static DetalleKey ClaveDetalle(CobroDetalleRequest r) =>
        new(r.MetodoPagoId, r.MonedaId, r.CuentaBancariaId);

    private readonly record struct DetalleKey(
        int MetodoPagoId,
        int MonedaId,
        int? CuentaBancariaId);
}