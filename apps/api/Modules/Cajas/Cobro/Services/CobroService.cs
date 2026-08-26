using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Clinica.Api.Modules.Cajas.Cobro.Enums;
using Clinica.Api.Modules.Cajas.Cobro.Mappers;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using System.Data;
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Cajas.Cobro.Services;

public sealed class CobroService(
    AppDbContext dbContext,
    CorrelativoService correlativoService,
    CobroDetalleService cobroDetalleService,
    ICurrentUserService currentUserService)
{
    private AppDbContext DbContext { get; } = dbContext;

    private DbSet<CobroEntity> Entities =>
        DbContext.Set<CobroEntity>();

    // ============================================================
    // LISTAR
    // ============================================================

    public async Task<PagedResult<CobroResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        EstadoCobro? estado = null,
        CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId;

        if (usuarioId is null)
            throw new UnauthorizedAccessException();

        var query = BuildQuery()
            .AsNoTracking();

        var esAdministrador =
            currentUserService.IsInRole("ADMINISTRADOR") ||
            currentUserService.IsInRole("ADMIN_CAJA");

        if (!esAdministrador)
        {
            var empleadoId = await DbContext.Users
                .Where(x => x.Id == usuarioId.Value)
                .Join(
                    DbContext.Empleados,
                    usuario => usuario.PersonaId,
                    empleado => empleado.PersonaId,
                    (_, empleado) => empleado.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (empleadoId == 0)
            {
                return new PagedResult<CobroResponse>(
                    [],
                    pagination.ValidPage,
                    pagination.ValidPageSize,
                    0);
            }

            query = query.Where(x => x.TurnoCaja.EmpleadoId == empleadoId);
        }

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
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

        return new PagedResult<CobroResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    // ============================================================
    // OBTENER
    // ============================================================

    public async Task<CobroResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity);
    }

    // ============================================================
    // GENERAR DESDE VENTA
    // ============================================================

    public async Task<CobroResponse> GenerarDesdeVentaAsync(
        GenerarCobroDesdeVentaRequest request,
        CancellationToken cancellationToken = default)
    {
        var ventaPagador = await DbContext
            .Set<VentaPagadorEntity>()
            .Include(x => x.Venta)
            .FirstOrDefaultAsync(
                x =>
                    x.Id == request.VentaPagadorId &&
                    x.Activo,
                cancellationToken);

        if (ventaPagador is null)
        {
            throw new NotFoundException(
                "VentaPagador",
                request.VentaPagadorId);
        }

        if (ventaPagador.Estado == EstadoVentaPagador.Pagado)
        {
            throw new ConflictException(
                "El pagador ya se encuentra pagado.");
        }

        if (ventaPagador.Estado == EstadoVentaPagador.Anulado)
        {
            throw new ConflictException(
                "El pagador se encuentra anulado.");
        }

        var caja = await DbContext
            .Set<Clinica.Api.Modules.Cajas.Caja.Entity.Caja>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == request.CajaId &&
                    x.Activo,
                cancellationToken);

        if (caja is null)
        {
            throw new NotFoundException(
                "Caja",
                request.CajaId);
        }

        var turnoCaja = await DbContext
            .Set<TurnoCajaEntity>()
            .FirstOrDefaultAsync(
                x =>
                    x.CajaId == request.CajaId &&
                    x.Estado == EstadoTurnoCaja.Abierto &&
                    x.Activo,
                cancellationToken);

        if (turnoCaja is null)
        {
            throw new ConflictException(
                $"La caja '{caja.Nombre}' no tiene un turno abierto.");
        }

        var cobroPendiente = await Entities
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.VentaPagadorId == ventaPagador.Id &&
                    x.Estado == EstadoCobro.Registrado &&
                    x.Activo,
                cancellationToken);

        if (cobroPendiente is not null)
        {
            return await ObtenerAsync(
                cobroPendiente.Id,
                cancellationToken);
        }

        var totalCobrado = await Entities
            .Where(x =>
                x.VentaPagadorId == ventaPagador.Id &&
                x.Activo &&
                x.Estado == EstadoCobro.Confirmado)
            .SumAsync(
                x => x.Total,
                cancellationToken);

        var saldoPendiente =
            ventaPagador.Monto - totalCobrado;

        if (saldoPendiente <= 0)
        {
            throw new ConflictException(
                "El pagador no tiene saldo pendiente.");
        }

        var fechaHora =
            DateTime.UtcNow;

        var correlativo =
            await correlativoService.GenerarAsync(
                new GenerarCorrelativoRequest
                {
                    Codigo = "COB",
                    Gestion = fechaHora.Year,
                    Prefijo = "COB",
                    Longitud = 6
                },
                cancellationToken);

        var cobro = new CobroEntity
        {
            Numero = correlativo.NumeroFormateado,
            TurnoCajaId = turnoCaja.Id,
            VentaPagadorId = ventaPagador.Id,
            FechaHora = fechaHora,
            Total = 0m,
            Estado = EstadoCobro.Registrado,
            Observacion = null,
            MotivoAnulacion = null,
            FechaHoraAnulacion = null,
            Activo = true,
            Detalles = []
        };

        await Entities.AddAsync(
            cobro,
            cancellationToken);

        await DbContext.SaveChangesAsync(
            cancellationToken);

        return await ObtenerAsync(
            cobro.Id,
            cancellationToken);
    }

    // ============================================================
    // CONFIRMAR
    // ============================================================

    public async Task<CobroResponse> ConfirmarAsync(
        int id,
        ConfirmarCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx =
            await DbContext.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);

        try
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
                    $"No se puede confirmar un cobro en estado {entity.Estado}.");
            }

            if (entity.TurnoCaja is null)
            {
                throw new ConflictException(
                    "El cobro no tiene un turno de caja asociado.");
            }

            if (!entity.TurnoCaja.Activo ||
                entity.TurnoCaja.Estado != EstadoTurnoCaja.Abierto)
            {
                throw new ConflictException(
                    "El turno de caja se encuentra cerrado.");
            }

            if (entity.VentaPagador is null ||
                !entity.VentaPagador.Activo)
            {
                throw new ConflictException(
                    "El pagador de la venta no se encuentra activo.");
            }

            if (entity.VentaPagador.Estado ==
                EstadoVentaPagador.Anulado)
            {
                throw new ConflictException(
                    "El pagador de la venta se encuentra anulado.");
            }

            if (entity.VentaPagador.Estado ==
                EstadoVentaPagador.Pagado)
            {
                throw new ConflictException(
                    "El pagador ya se encuentra pagado.");
            }

            if (request.Detalles.Count == 0)
            {
                throw new ConflictException(
                    "Debe registrar al menos una forma de pago.");
            }

            await cobroDetalleService.ValidarAsync(
                request.Detalles,
                cancellationToken);

            var totalCobradoAnterior = await Entities
                .Where(x =>
                    x.VentaPagadorId == entity.VentaPagadorId &&
                    x.Id != entity.Id &&
                    x.Activo &&
                    x.Estado == EstadoCobro.Confirmado)
                .SumAsync(
                    x => x.Total,
                    cancellationToken);

            var saldoPendiente =
                entity.VentaPagador.Monto -
                totalCobradoAnterior;

            if (saldoPendiente <= 0)
            {
                throw new ConflictException(
                    "El pagador no tiene saldo pendiente.");
            }

            CobroMapper.UpdateEntity(
                request,
                entity);

            CobroDetalleMapper.ReemplazarDetalles(
                entity,
                request.Detalles);

            CobroDetalleMapper.CalcularTotal(
                entity);

            entity.Observacion =
                CobroDetalleMapper.NormalizarOpcional(
                    entity.Observacion);

            if (entity.Total <= 0)
            {
                throw new ConflictException(
                    "El total del cobro debe ser mayor a cero.");
            }

            if (entity.Total > saldoPendiente)
            {
                throw new ConflictException(
                    $"El monto del cobro ({entity.Total:N2}) " +
                    $"no puede superar el saldo pendiente ({saldoPendiente:N2}).");
            }

            entity.Estado =
                EstadoCobro.Confirmado;

            await DbContext.SaveChangesAsync(
                cancellationToken);

            await SincronizarEstadoVentaYPagadorAsync(
                entity.VentaPagadorId,
                cancellationToken);

            await DbContext.SaveChangesAsync(
                cancellationToken);

            await tx.CommitAsync(
                cancellationToken);

            return await ObtenerAsync(
                entity.Id,
                cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(
                cancellationToken);

            throw;
        }
    }

    // ============================================================
    // ANULAR
    // ============================================================

    public async Task<CobroResponse> AnularAsync(
        int id,
        AnularCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx =
            await DbContext.Database.BeginTransactionAsync(
                cancellationToken);

        try
        {
            var entity = await BuildQuery()
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);

            if (entity is null)
                throw CreateNotFoundException(id);

            if (entity.Estado == EstadoCobro.Anulado)
            {
                throw new ConflictException(
                    "El cobro ya se encuentra anulado.");
            }

            if (entity.Estado == EstadoCobro.Devuelto)
            {
                throw new ConflictException(
                    "No se puede anular un cobro que ya fue devuelto.");
            }

            if (entity.Estado == EstadoCobro.DevueltoParcial)
            {
                throw new ConflictException(
                    "No se puede anular un cobro con devolución parcial.");
            }

            if (string.IsNullOrWhiteSpace(
                    request.MotivoAnulacion))
            {
                throw new ConflictException(
                    "El motivo de anulación es obligatorio.");
            }

            if (entity.Estado == EstadoCobro.Confirmado &&
                entity.TurnoCaja.Estado == EstadoTurnoCaja.Cerrado)
            {
                throw new ConflictException(
                    "No se puede anular un cobro de un turno cerrado. " +
                    "Debe registrar una devolución.");
            }

            entity.Estado =
                EstadoCobro.Anulado;

            entity.MotivoAnulacion =
                request.MotivoAnulacion.Trim();

            entity.FechaHoraAnulacion =
                DateTime.UtcNow;

            entity.Activo =
                true;

            await DbContext.SaveChangesAsync(
                cancellationToken);

            await SincronizarEstadoVentaYPagadorAsync(
                entity.VentaPagadorId,
                cancellationToken);

            await DbContext.SaveChangesAsync(
                cancellationToken);

            await tx.CommitAsync(
                cancellationToken);

            return await ObtenerAsync(
                entity.Id,
                cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(
                cancellationToken);

            throw;
        }
    }

    // ============================================================
    // SINCRONIZAR VENTA / PAGADOR
    // ============================================================

    private async Task SincronizarEstadoVentaYPagadorAsync(
        int ventaPagadorId,
        CancellationToken cancellationToken)
    {
        var ventaPagador = await DbContext
            .Set<VentaPagadorEntity>()
            .Include(x => x.Venta)
            .ThenInclude(x => x.Pagadores)
            .FirstOrDefaultAsync(
                x => x.Id == ventaPagadorId,
                cancellationToken);

        if (ventaPagador is null)
            return;

        var totalCobrado = await Entities
            .Where(x =>
                x.VentaPagadorId == ventaPagador.Id &&
                x.Activo &&
                x.Estado == EstadoCobro.Confirmado)
            .SumAsync(
                x => x.Total,
                cancellationToken);

        if (ventaPagador.Monto > 0 &&
            totalCobrado >= ventaPagador.Monto)
        {
            ventaPagador.Estado =
                EstadoVentaPagador.Pagado;
        }
        else if (totalCobrado > 0)
        {
            ventaPagador.Estado =
                EstadoVentaPagador.ParcialmentePagado;
        }
        else
        {
            ventaPagador.Estado =
                EstadoVentaPagador.Pendiente;
        }

        if (ventaPagador.Venta is null)
            return;

        var pagadoresActivos =
            ventaPagador.Venta.Pagadores
                .Where(x =>
                    x.Activo &&
                    x.Estado != EstadoVentaPagador.Anulado)
                .ToList();

        if (pagadoresActivos.Count > 0 &&
            pagadoresActivos.All(x => x.Estado ==
                                      EstadoVentaPagador.Pagado))
        {
            ventaPagador.Venta.Estado =
                EstadoVenta.Pagada;

            return;
        }

        if (pagadoresActivos.Any(x => x.Estado is
                EstadoVentaPagador.Pagado or
                EstadoVentaPagador.ParcialmentePagado))
        {
            ventaPagador.Venta.Estado =
                EstadoVenta.ParcialmentePagada;

            return;
        }

        ventaPagador.Venta.Estado =
            EstadoVenta.PendienteCobro;
    }

    // ============================================================
    // QUERY
    // ============================================================

    private IQueryable<CobroEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja)
            .ThenInclude(x => x.Caja)
            .Include(x => x.TurnoCaja)
            .ThenInclude(x => x.Empleado)
            .ThenInclude(x => x.Persona)
            .Include(x => x.VentaPagador)
            .ThenInclude(x => x.Venta)
            .ThenInclude(x => x.Paciente)
            .ThenInclude(x => x.Persona)
            .Include(x => x.VentaPagador)
            .ThenInclude(x => x.Convenio)
            .Include(x => x.Detalles)
            .ThenInclude(x => x.MetodoPago)
            .Include(x => x.Detalles)
            .ThenInclude(x => x.Moneda)
            .Include(x => x.Detalles)
            .ThenInclude(x => x.CuentaBancaria);
    }

    // ============================================================
    // ORDER
    // ============================================================

    private static IQueryable<CobroEntity> ApplyOrder(
        IQueryable<CobroEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    // ============================================================
    // SEARCH
    // ============================================================

    private static IQueryable<CobroEntity> ApplySearch(
        IQueryable<CobroEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Numero.Contains(search) ||
            (
                x.VentaPagador != null &&
                x.VentaPagador.Venta != null &&
                x.VentaPagador.Venta.Numero.Contains(search)
            ) ||
            (
                x.VentaPagador != null &&
                x.VentaPagador.Venta != null &&
                x.VentaPagador.Venta.Paciente != null &&
                x.VentaPagador.Venta.Paciente.Persona != null &&
                (
                    x.VentaPagador.Venta.Paciente.Persona.Nombres
                        .Contains(search) ||
                    x.VentaPagador.Venta.Paciente.Persona
                        .ApellidoPaterno.Contains(search) ||
                    (
                        x.VentaPagador.Venta.Paciente.Persona
                            .ApellidoMaterno != null &&
                        x.VentaPagador.Venta.Paciente.Persona
                            .ApellidoMaterno.Contains(search)
                    ) ||
                    x.VentaPagador.Venta.Paciente.Persona
                        .NumeroDocumento.Contains(search)
                )
            ) ||
            (
                x.VentaPagador != null &&
                x.VentaPagador.Convenio != null &&
                x.VentaPagador.Convenio.Nombre.Contains(search)
            )
        );
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    private static CobroResponse MapToResponse(
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

            Detalles = CobroDetalleMapper.MapDetalles(entity.Detalles
                        .Where(x => x.Activo)),

            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static IReadOnlyCollection<CobroResponse>
        MapToResponseList(
            IEnumerable<CobroEntity> entities)
    {
        return entities
            .Select(MapToResponse)
            .ToList();
    }

    // ============================================================
    // TURNO CAJA INFO
    // ============================================================

    private static TurnoCajaInfo? MapTurnoCajaInfo(
        TurnoCajaEntity? turno)
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

    // ============================================================
    // CAJA INFO
    // ============================================================

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

    // ============================================================
    // EMPLEADO INFO
    // ============================================================

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

    // ============================================================
    // VENTA PAGADOR INFO
    // ============================================================

    private static VentaPagadorInfo? MapVentaPagadorInfo(
        VentaPagadorEntity? pagador)
    {
        if (pagador is null)
            return null;
        
        var paciente = pagador.Venta?.Paciente;
        var persona = paciente?.Persona;
        var pacienteNombre =
            persona is null
                ? null
                : string.Join(
                    " ",
                    new[]
                        {
                            persona.Nombres,
                            persona.ApellidoPaterno,
                            persona.ApellidoMaterno
                        }
                        .Where(x => !string.IsNullOrWhiteSpace(x)));

        return new VentaPagadorInfo
        {
            Id = pagador.Id,
            Tipo = pagador.Tipo,
            VentaId = pagador.VentaId,
            VentaNumero = pagador.Venta?.Numero ?? string.Empty,
            VentaTotal = pagador.Venta?.Total ?? 0m,
            PacienteId = paciente?.Id,
            PacienteNombreCompleto = pacienteNombre,
            PacienteDocumento = persona?.NumeroDocumento,
            NumeroHistoriaClinica = paciente?.NumeroHistoriaClinica,
            ConvenioId = pagador.ConvenioId,
            ConvenioNombre = pagador.Convenio?.Nombre,
            Monto = pagador.Monto,
            Estado = pagador.Estado
        };
    }

    // ============================================================
    // EXCEPTION
    // ============================================================

    private static NotFoundException CreateNotFoundException(int id)
    {
        return new NotFoundException(typeof(CobroEntity).Name, id);
    }
}