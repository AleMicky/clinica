using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;
using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Modules.Cajas.TurnoCaja.Mappers;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CajaEntity = Clinica.Api.Modules.Cajas.Caja.Entity.Caja;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Services;

public sealed class TurnoCajaService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService)
{
    private AppDbContext DbContext { get; } = dbContext;
    private DbSet<TurnoCajaEntity> Entities => DbContext.Set<TurnoCajaEntity>();

    public async Task<PagedResult<TurnoCajaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        int? cajaId = null,
        int? empleadoId = null,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (cajaId.HasValue && cajaId.Value > 0)
        {
            query = query.Where(x => x.CajaId == cajaId.Value);
        }

        if (empleadoId.HasValue && empleadoId.Value > 0)
        {
            query = query.Where(x => x.EmpleadoId == empleadoId.Value);
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

        return new PagedResult<TurnoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<PagedResult<TurnoCajaResponse>> ListarMisTurnosAsync(
        PaginationRequest pagination,
        string? search,
        int? cajaId = null,
        bool? soloPropio = null,
        CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId
            ?? throw new UnauthorizedAccessException();

        var esAdministrador = EsUsuarioAdministrador();
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!esAdministrador || soloPropio == true)
        {
            var empleado = await ObtenerEmpleadoPorUsuarioIdAsync(
                usuarioId,
                cancellationToken);

            if (empleado is null)
            {
                if (!esAdministrador)
                {
                    return new PagedResult<TurnoCajaResponse>(
                        [],
                        pagination.ValidPage,
                        pagination.ValidPageSize,
                        0);
                }
            }
            else
            {
                query = query.Where(x => x.EmpleadoId == empleado.Id);
            }
        }

        if (cajaId.HasValue && cajaId.Value > 0)
        {
            query = query.Where(x => x.CajaId == cajaId.Value);
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

        return new PagedResult<TurnoCajaResponse>(
            MapToResponseList(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<MiSesionTurnoCajaResponse> ObtenerMiSesionAsync(
        CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId
            ?? throw new UnauthorizedAccessException();

        var usuario = await DbContext.Users
            .AsNoTracking()
            .Include(x => x.Persona)
            .FirstOrDefaultAsync(x => x.Id == usuarioId, cancellationToken)
            ?? throw new UnauthorizedAccessException();

        var esAdministrador = EsUsuarioAdministrador();
        var empleado = await ObtenerEmpleadoPorUsuarioIdAsync(
            usuarioId,
            cancellationToken);

        var nombreCompletoUsuario = usuario.Persona is not null
            ? string.Join(" ",
                new[]
                {
                    usuario.Persona.Nombres,
                    usuario.Persona.ApellidoPaterno,
                    usuario.Persona.ApellidoMaterno
                }.Where(x => !string.IsNullOrWhiteSpace(x)))
            : usuario.UserName ?? string.Empty;

        TurnoCajaResponse? turnoAbierto = null;
        if (empleado is not null)
        {
            turnoAbierto = await ObtenerTurnoAbiertoEmpleadoAsync(
                empleado.Id,
                cancellationToken);
        }

        return new MiSesionTurnoCajaResponse
        {
            UsuarioId = usuario.Id,
            UserName = usuario.UserName ?? string.Empty,
            NombreCompleto = nombreCompletoUsuario,
            EsAdministrador = esAdministrador,
            Empleado = MapEmpleadoInfo(empleado),
            TurnoAbierto = turnoAbierto
        };
    }

    public async Task<TurnoCajaResponse> AbrirMiTurnoAsync(
        AbrirMiTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId
            ?? throw new UnauthorizedAccessException();

        var empleado = await ObtenerEmpleadoPorUsuarioIdAsync(
            usuarioId,
            cancellationToken)
            ?? throw new BusinessException(
                "Su usuario no tiene una ficha de empleado activa vinculada para aperturar un turno de caja.");

        return await AbrirAsync(
            new AbrirTurnoCajaRequest
            {
                CajaId = request.CajaId,
                EmpleadoId = empleado.Id,
                MontoInicial = request.MontoInicial,
                Observacion = request.Observacion
            },
            cancellationToken);
    }

    public async Task<TurnoCajaResponse> ObtenerAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        return entity is null ? throw CreateNotFoundException(id) : MapToResponse(entity);
    }


    public async Task<TurnoCajaResponse> CrearAsync(CreateTurnoCajaRequest request,
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

        await ValidarEmpleadoSinTurnoAbiertoAsync(
            request.EmpleadoId,
            null,
            cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<TurnoCajaResponse> AbrirAsync(AbrirTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.MontoInicial < 0)
        {
            throw new BusinessException(
                "El monto inicial no puede ser negativo.");
        }

        await ValidarFksAsync(request.CajaId, request.EmpleadoId, cancellationToken);
        await ValidarUnicoAbiertoAsync(request.CajaId, null, cancellationToken);
        await ValidarEmpleadoSinTurnoAbiertoAsync(request.EmpleadoId, null, cancellationToken);

        var entity = new TurnoCajaEntity
        {
            CajaId = request.CajaId,
            EmpleadoId = request.EmpleadoId,
            FechaHoraApertura = DateTime.UtcNow,
            MontoInicial = request.MontoInicial,
            ObservacionApertura = string.IsNullOrWhiteSpace(request.Observacion)
                ? null
                : request.Observacion.Trim(),
            Estado = EstadoTurnoCaja.Abierto,
            Activo = true
        };

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);
        await CargarNavegacionesAsync(entity, cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<TurnoCajaResponse> CerrarAsync(
        int id,
        CerrarTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .FirstOrDefaultAsync(
                x =>
                    x.Id == id &&
                    x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        if (entity.Estado == EstadoTurnoCaja.Cerrado)
        {
            throw new ConflictException(
                "El turno de caja ya se encuentra cerrado.");
        }

        var arqueo = await DbContext.ArqueosCaja
            .AsNoTracking()
            .Where(x =>
                x.TurnoCajaId == id &&
                x.Activo)
            .OrderByDescending(x => x.FechaHora)
            .FirstOrDefaultAsync(cancellationToken);

        if (arqueo is null)
        {
            throw new ConflictException(
                "Debe realizar el arqueo antes de cerrar el turno.");
        }

        var existenMovimientosPosteriores = await DbContext
            .Set<Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja>()
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.TurnoCajaId == id &&
                    x.Activo &&
                    x.FechaHora > arqueo.FechaHora,
                cancellationToken);

        if (existenMovimientosPosteriores)
        {
            throw new ConflictException(
                "Existen movimientos de caja posteriores al arqueo. " +
                "Debe realizar un nuevo arqueo antes de cerrar el turno.");
        }

        var existenCobrosPosteriores = await DbContext.Cobros
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.TurnoCajaId == id &&
                    x.Activo &&
                    x.FechaHora > arqueo.FechaHora,
                cancellationToken);

        if (existenCobrosPosteriores)
        {
            throw new ConflictException(
                "Existen cobros posteriores al arqueo. " +
                "Debe realizar un nuevo arqueo antes de cerrar el turno.");
        }

        entity.FechaHoraCierre =
            DateTime.UtcNow;

        entity.ObservacionCierre =
            string.IsNullOrWhiteSpace(request.Observacion)
                ? null
                : request.Observacion.Trim();

        entity.Estado =
            EstadoTurnoCaja.Cerrado;

        await DbContext.SaveChangesAsync(
            cancellationToken);

        return MapToResponse(entity);
    }

    public async Task<TurnoCajaResponse?> ObtenerTurnoAbiertoEmpleadoAsync(int empleadoId,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.EmpleadoId == empleadoId &&
                    x.Estado == EstadoTurnoCaja.Abierto &&
                    x.Activo,
                cancellationToken);

        return entity is null
            ? null
            : MapToResponse(entity);
    }

    public async Task<TurnoCajaResponse?> ObtenerTurnoAbiertoCajaAsync(
        int cajaId,
        CancellationToken cancellationToken = default)
    {
        var entity = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x =>
                    x.CajaId == cajaId &&
                    x.Estado == EstadoTurnoCaja.Abierto &&
                    x.Activo,
                cancellationToken);

        return entity is null
            ? null
            : MapToResponse(entity);
    }
    
    public async Task<ResumenCierreTurnoCajaResponse> ObtenerResumenCierreAsync(
    int id,
    CancellationToken cancellationToken = default)
{
    var turno = await Entities
        .AsNoTracking()
        .FirstOrDefaultAsync(
            x =>
                x.Id == id &&
                x.Activo,
            cancellationToken);

    if (turno is null)
        throw CreateNotFoundException(id);

    if (turno.Estado != EstadoTurnoCaja.Abierto)
    {
        throw new ConflictException(
            "El turno de caja no se encuentra abierto.");
    }

    var arqueo = await DbContext.ArqueosCaja
        .AsNoTracking()
        .Include(x => x.Detalles)
            .ThenInclude(x => x.MetodoPago)
        .Include(x => x.Detalles)
            .ThenInclude(x => x.Moneda)
        .Where(x =>
            x.TurnoCajaId == id &&
            x.Activo)
        .OrderByDescending(x => x.FechaHora)
        .FirstOrDefaultAsync(cancellationToken);

    if (arqueo is null)
    {
        throw new ConflictException(
            "Debe realizar el arqueo antes de cerrar el turno.");
    }

    var existenMovimientosPosteriores = await DbContext
        .Set<Clinica.Api.Modules.Cajas.MovimientoCaja.Entity.MovimientoCaja>()
        .AsNoTracking()
        .AnyAsync(
            x =>
                x.TurnoCajaId == id &&
                x.Activo &&
                x.FechaHora > arqueo.FechaHora,
            cancellationToken);

    if (existenMovimientosPosteriores)
    {
        throw new ConflictException(
            "Existen movimientos posteriores al arqueo. " +
            "Debe realizar nuevamente el arqueo.");
    }

    var existenCobrosPosteriores = await DbContext.Cobros
        .AsNoTracking()
        .AnyAsync(
            x =>
                x.TurnoCajaId == id &&
                x.Activo &&
                x.FechaHora > arqueo.FechaHora,
            cancellationToken);

    if (existenCobrosPosteriores)
    {
        throw new ConflictException(
            "Existen cobros posteriores al arqueo. " +
            "Debe realizar nuevamente el arqueo.");
    }

    return new ResumenCierreTurnoCajaResponse
    {
        TurnoCajaId = turno.Id,

        ArqueoCajaId = arqueo.Id,

        FechaHoraApertura = turno.FechaHoraApertura,

        FechaHoraArqueo = arqueo.FechaHora,

        MontoInicial = turno.MontoInicial,

        TotalEsperado = arqueo.TotalEsperado,

        TotalContado = arqueo.TotalContado,

        Diferencia = arqueo.Diferencia,

        ObservacionArqueo = arqueo.Observacion,

        Detalles = arqueo.Detalles
            .Where(x => x.Activo)
            .Select(x => new ArqueoCajaDetalleResponse
            {
                Id = x.Id,
                ArqueoCajaId = x.ArqueoCajaId,

                MetodoPagoId = x.MetodoPagoId,

                MetodoPago = new()
                {
                    Id = x.MetodoPago.Id,
                    Codigo = x.MetodoPago.Codigo,
                    Nombre = x.MetodoPago.Nombre
                },

                MonedaId = x.MonedaId,

                Moneda = new()
                {
                    Id = x.Moneda.Id,
                    Codigo = x.Moneda.Codigo,
                    Nombre = x.Moneda.Nombre,
                    Simbolo = x.Moneda.Simbolo
                },

                MontoEsperado = x.MontoEsperado,
                MontoContado = x.MontoContado,
                Diferencia = x.Diferencia,

                Activo = x.Activo,
                FechaCreacion = x.FechaCreacion,
                FechaModificacion = x.FechaModificacion,
                CreadoPor = x.CreadoPor,
                ModificadoPor = x.ModificadoPor
            })
            .ToList()
    };
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

    public async Task EliminarAsync(int id, CancellationToken cancellationToken = default)
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

    private async Task ValidarEmpleadoSinTurnoAbiertoAsync(
        int empleadoId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var query = Entities.Where(x =>
            x.EmpleadoId == empleadoId &&
            x.Estado == EstadoTurnoCaja.Abierto);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        var existe = await query.AnyAsync(cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                "El empleado ya tiene un turno de caja abierto.");
        }
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
            MontoInicial = entity.MontoInicial,
            ObservacionApertura = entity.ObservacionApertura,
            FechaHoraCierre = entity.FechaHoraCierre,
            ObservacionCierre = entity.ObservacionCierre,
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

    private bool EsUsuarioAdministrador()
    {
        return currentUserService.IsInRole("ADMINISTRADOR") ||
               currentUserService.IsInRole("Administrador") ||
               currentUserService.IsInRole("ADMIN_CAJA");
    }

    private async Task<EmpleadoEntity?> ObtenerEmpleadoPorUsuarioIdAsync(
        int usuarioId,
        CancellationToken cancellationToken)
    {
        var personaId = await DbContext.Users
            .AsNoTracking()
            .Where(x => x.Id == usuarioId)
            .Select(x => (int?)x.PersonaId)
            .FirstOrDefaultAsync(cancellationToken);

        if (!personaId.HasValue || personaId.Value <= 0)
            return null;

        return await DbContext.Empleados
            .AsNoTracking()
            .Include(x => x.Persona)
            .FirstOrDefaultAsync(
                x => x.PersonaId == personaId.Value && x.Activo,
                cancellationToken);
    }

    private static NotFoundException CreateNotFoundException(int id)
    {
        return new NotFoundException(typeof(TurnoCajaEntity).Name, id);
    }
}