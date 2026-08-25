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
using CobroEntity = Clinica.Api.Modules.Cajas.Cobro.Entity.Cobro;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;
using VentaPagadorEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaPagador;

namespace Clinica.Api.Modules.Cajas.Cobro.Services;

public sealed class CobroService(
    AppDbContext dbContext,
    CorrelativoService correlativoService,
    CobroDetalleService cobroDetalleService,
    ICurrentUserService currentUserService
)
{
    private AppDbContext DbContext { get; } = dbContext;
    private DbSet<CobroEntity> Entities => DbContext.Set<CobroEntity>();

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
            .AsNoTracking()
            .Where(x => x.Activo);

        // Si NO es ADMIN, solo ve los cobros del turno de caja asignado a su empleado
        if (!currentUserService.IsInRole("ADMINISTRADOR"))
        {
            var empleadoId = await dbContext.Users
                .Where(u => u.Id == usuarioId.Value)
                .Join(
                    dbContext.Empleados,
                    usuario => usuario.PersonaId,
                    empleado => empleado.PersonaId,
                    (usuario, empleado) => empleado.Id
                )
                .FirstOrDefaultAsync(cancellationToken);

            if (empleadoId == 0)
            {
                return new PagedResult<CobroResponse>(
                    [],
                    pagination.ValidPage,
                    pagination.ValidPageSize,
                    0);
            }

            // Filtro a través de la relación con TurnoCaja
            query = query.Where(x => x.TurnoCaja.EmpleadoId == empleadoId);
        }

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
        }

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        query = ApplySearch(query, normalizedSearch);

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

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
    public async Task<CobroResponse> ObtenerAsync(
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
            Detalles = CobroDetalleMapper.MapDetalles(
                entity.Detalles.Where(x => x.Activo))
        };
    }

    public async Task<CobroResponse> CrearAsync(CreateCobroRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarFksAsync(request.TurnoCajaId, request.VentaPagadorId, cancellationToken);
        await cobroDetalleService.ValidarMetodosPagoAsync(request.Detalles, cancellationToken);
        await cobroDetalleService.ValidarMonedasAsync(request.Detalles, cancellationToken);
        await cobroDetalleService.ValidarCuentasBancariasAsync(request.Detalles, cancellationToken);
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

    public async Task<CobroResponse> ActualizarAsync(int id, UpdateCobroRequest request,
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

        await cobroDetalleService.ValidarMetodosPagoAsync(
            request.Detalles,
            cancellationToken);

        await cobroDetalleService.ValidarMonedasAsync(
            request.Detalles,
            cancellationToken);

        await cobroDetalleService.ValidarCuentasBancariasAsync(
            request.Detalles,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await SincronizarEstadoVentaYPagadorAsync(entity.VentaPagadorId, cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }


    public async Task EliminarAsync(int id, CancellationToken cancellationToken = default)
    {
        await AnularAsync(id, null, cancellationToken);
    }

    public async Task<CobroResponse> AnularAsync(int id, string? motivo, CancellationToken cancellationToken = default)
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

        await SincronizarEstadoVentaYPagadorAsync(entity.VentaPagadorId, cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    private async Task SincronizarEstadoVentaYPagadorAsync(
        int ventaPagadorId,
        CancellationToken cancellationToken)
    {
        var ventaPagador = await DbContext.Set<VentaPagadorEntity>()
            .Include(vp => vp.Venta)
                .ThenInclude(v => v.Pagadores)
            .FirstOrDefaultAsync(vp => vp.Id == ventaPagadorId, cancellationToken);

        if (ventaPagador is null) return;

        var totalCobrado = await Entities
            .Where(c => c.VentaPagadorId == ventaPagador.Id && c.Activo && c.Estado != EstadoCobro.Anulado)
            .SumAsync(c => c.Total, cancellationToken);

        if (totalCobrado >= ventaPagador.Monto && ventaPagador.Monto > 0)
        {
            ventaPagador.Estado = EstadoVentaPagador.Pagado;
        }
        else if (totalCobrado > 0)
        {
            ventaPagador.Estado = EstadoVentaPagador.ParcialmentePagado;
        }
        else
        {
            ventaPagador.Estado = EstadoVentaPagador.Pendiente;
        }

        if (ventaPagador.Venta is not null)
        {
            var pagadoresActivos = ventaPagador.Venta.Pagadores
                .Where(p => p.Activo && p.Estado != EstadoVentaPagador.Anulado)
                .ToList();

            if (pagadoresActivos.Count > 0 && pagadoresActivos.All(p => p.Estado == EstadoVentaPagador.Pagado))
            {
                ventaPagador.Venta.Estado = EstadoVenta.Pagada;
            }
            else if (pagadoresActivos.Any(p => p.Estado is EstadoVentaPagador.Pagado or EstadoVentaPagador.ParcialmentePagado))
            {
                ventaPagador.Venta.Estado = EstadoVenta.ParcialmentePagada;
            }
            else
            {
                ventaPagador.Venta.Estado = EstadoVenta.PendienteCobro;
            }
        }
    }

    public async Task GenerarDesdeVentaAsync(GenerarCobroDesdeVentaRequest request,CancellationToken cancellationToken = default)
    {
        var ventaPagador = await DbContext
            .Set<VentaPagadorEntity>()
            .Include(x => x.Venta)
            .FirstOrDefaultAsync(
                x => x.Id == request.VentaPagadorId &&
                     x.Activo,
                cancellationToken);

        if (ventaPagador is null)
        {
            throw new NotFoundException("VentaPagador", request.VentaPagadorId);
        }

        switch (ventaPagador.Estado)
        {
            case EstadoVentaPagador.Pagado:
                throw new ConflictException("El pagador ya se encuentra pagado.");
            case EstadoVentaPagador.Anulado:
                throw new ConflictException("El pagador se encuentra anulado.");
        }

        var caja = await DbContext
            .Set<Clinica.Api.Modules.Cajas.Caja.Entity.Caja>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == request.CajaId &&
                     x.Activo,
                cancellationToken);

        if (caja is null)
        {
            throw new NotFoundException("Caja", request.CajaId);
        }

        var turnoCaja = await DbContext
            .Set<TurnoCajaEntity>()
            .FirstOrDefaultAsync(
                x => x.CajaId == request.CajaId &&
                     x.Estado == EstadoTurnoCaja.Abierto &&
                     x.Activo,
                cancellationToken);

        if (turnoCaja is null)
        {
            throw new ConflictException($"La caja '{caja.Nombre}' no tiene un turno abierto.");
        }

        var existeCobroPendiente = await Entities
            .AnyAsync(x => x.VentaPagadorId == ventaPagador.Id &&
                           x.Estado == EstadoCobro.Registrado &&
                           x.Activo,
                cancellationToken);

        if (existeCobroPendiente)
        {
            throw new ConflictException("Ya existe un cobro pendiente para este pagador.");
        }

        var fechaHora = DateTime.UtcNow;

        var correlativo = await correlativoService.GenerarAsync(
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
            Activo = true,
            Detalles = []
        };

        await Entities.AddAsync(cobro, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);
    }


    private IQueryable<CobroEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Caja)
            .Include(x => x.TurnoCaja).ThenInclude(t => t.Empleado).ThenInclude(e => e.Persona)
            .Include(x => x.VentaPagador).ThenInclude(p => p.Venta).ThenInclude(v => v.Paciente).ThenInclude(pac => pac.Persona)
            .Include(x => x.VentaPagador).ThenInclude(p => p.Convenio)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.MetodoPago)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Moneda)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.CuentaBancaria);
            
    }

    private IQueryable<CobroEntity> ApplyOrder(IQueryable<CobroEntity> query)
    {
        return query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id);
    }

    private CobroEntity MapToNewEntity(CreateCobroRequest request)
    {
        var entity = CobroMapper.ToEntity(request);
        entity.Estado = EstadoCobro.Registrado;
        entity.Detalles = request.Detalles
            .Select(CobroDetalleMapper.CrearDetalle)
            .ToList();
        CobroDetalleMapper.CalcularTotal(entity);
        Normalizar(entity);
        return entity;
    }

    private void MapToExistingEntity(UpdateCobroRequest request, CobroEntity entity)
    {
        CobroMapper.UpdateEntity(request, entity);
        CobroDetalleMapper.ReemplazarDetalles(entity, request.Detalles);
        CobroDetalleMapper.CalcularTotal(entity);
        Normalizar(entity);
    }

    private static CobroResponse MapToResponse(CobroEntity entity)
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
            Detalles = CobroDetalleMapper.MapDetalles(entity.Detalles.Where(x => x.Activo)),
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion,
            CreadoPor = entity.CreadoPor,
            ModificadoPor = entity.ModificadoPor
        };
    }

    private static IReadOnlyCollection<CobroResponse> MapToResponseList(IEnumerable<CobroEntity> entities)
    {
        return entities.Select(MapToResponse).ToList();
    }

    private IQueryable<CobroEntity> ApplySearch(IQueryable<CobroEntity> query, string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Numero.Contains(search) ||
            (x.VentaPagador != null && x.VentaPagador.Venta != null && x.VentaPagador.Venta.Numero.Contains(search)) ||
            (x.VentaPagador != null && x.VentaPagador.Venta != null && x.VentaPagador.Venta.Paciente != null && x.VentaPagador.Venta.Paciente.Persona != null && (
                x.VentaPagador.Venta.Paciente.Persona.Nombres.Contains(search) ||
                x.VentaPagador.Venta.Paciente.Persona.ApellidoPaterno.Contains(search) ||
                (x.VentaPagador.Venta.Paciente.Persona.ApellidoMaterno != null && x.VentaPagador.Venta.Paciente.Persona.ApellidoMaterno.Contains(search)) ||
                x.VentaPagador.Venta.Paciente.Persona.NumeroDocumento.Contains(search)
            )) ||
            (x.VentaPagador != null && x.VentaPagador.Convenio != null && x.VentaPagador.Convenio.Nombre.Contains(search))
        );
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

    private static void Normalizar(CobroEntity entity)
    {
        entity.Observacion = CobroDetalleMapper.NormalizarOpcional(entity.Observacion);
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

    private static EmpleadoInfo? MapEmpleadoInfo(Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado? empleado)
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

        var paciente = pagador.Venta?.Paciente;
        var persona = paciente?.Persona;

        var pacienteNombre = persona is not null
            ? string.Join(" ",
                new[]
                {
                    persona.Nombres,
                    persona.ApellidoPaterno,
                    persona.ApellidoMaterno
                }.Where(x => !string.IsNullOrWhiteSpace(x)))
            : null;

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

    private static NotFoundException CreateNotFoundException(int id)
    {
        return new NotFoundException(typeof(CobroEntity).Name, id);
    }
}