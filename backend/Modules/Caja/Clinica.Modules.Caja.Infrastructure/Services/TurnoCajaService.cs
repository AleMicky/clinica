using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Turnos;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class TurnoCajaService(
    CajaDbContext context,
    ICurrentUser currentUser,
    ICorrelativoService correlativoService) : ITurnoCajaService
{
    public const string ConceptoFondoInicial = "FONDO_INICIAL";

    public async Task<TurnoCajaResponse> AbrirAsync(
        AbrirTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new BusinessException("Usuario no autenticado.");

        var caja = await context.Cajas.FirstOrDefaultAsync(x => x.Id == request.CajaId, cancellationToken)
            ?? throw new NotFoundException("Caja no encontrada.");

        if (!caja.Activo)
            throw new BusinessException("No se puede abrir turno en una caja inactiva.");

        var cajaConTurno = await context.TurnosCaja.AnyAsync(
            x => x.CajaId == request.CajaId && x.Estado == TurnoCajaEstados.Abierto,
            cancellationToken);
        if (cajaConTurno)
            throw new BusinessException("La caja ya tiene un turno abierto.");

        var empleadoConTurno = await context.TurnosCaja.AnyAsync(
            x => x.EmpleadoAperturaId == userId && x.Estado == TurnoCajaEstados.Abierto,
            cancellationToken);
        if (empleadoConTurno)
            throw new BusinessException("El empleado ya tiene un turno abierto.");

        var turno = new TurnoCaja
        {
            Id = Guid.NewGuid(),
            CajaId = caja.Id,
            EmpleadoAperturaId = userId,
            FechaApertura = DateTime.UtcNow,
            MontoInicial = request.MontoInicial,
            Estado = TurnoCajaEstados.Abierto,
            ObservacionApertura = string.IsNullOrWhiteSpace(request.ObservacionApertura)
                ? null
                : request.ObservacionApertura.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserName,
        };

        context.TurnosCaja.Add(turno);
        await context.SaveChangesAsync(cancellationToken);

        if (request.MontoInicial > 0)
        {
            var concepto = await context.ConceptosCaja.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Codigo == ConceptoFondoInicial && x.Activo, cancellationToken)
                ?? throw new BusinessException("Concepto FONDO_INICIAL no configurado.");

            var efectivo = await context.MetodosPago.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Codigo == "EFECTIVO", cancellationToken);

            var correlativo = await correlativoService.GenerarAsync(
                new GenerarCorrelativoRequest("CAJA_MOVIMIENTO", Prefijo: "MOV-", Longitud: 6),
                cancellationToken);

            context.MovimientosCaja.Add(new MovimientoCaja
            {
                Id = Guid.NewGuid(),
                Numero = correlativo.NumeroFormateado,
                TurnoCajaId = turno.Id,
                ConceptoCajaId = concepto.Id,
                TipoMovimiento = TipoMovimientoCaja.Ingreso,
                Fecha = DateTime.UtcNow,
                Importe = request.MontoInicial,
                MetodoPagoId = efectivo?.Id,
                Descripcion = "Fondo inicial de apertura",
                Estado = MovimientoCajaEstados.Confirmado,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUser.UserName,
            });

            await context.SaveChangesAsync(cancellationToken);
        }

        return await GetByIdAsync(turno.Id, cancellationToken)
            ?? throw new NotFoundException("Turno no encontrado tras apertura.");
    }

    public async Task<TurnoCajaResponse?> ObtenerTurnoAbiertoAsync(CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId;
        if (userId is null)
            return null;

        var turnoId = await context.TurnosCaja.AsNoTracking()
            .Where(x => x.EmpleadoAperturaId == userId && x.Estado == TurnoCajaEstados.Abierto)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (turnoId == Guid.Empty)
            return null;

        return await GetByIdAsync(turnoId, cancellationToken);
    }

    public async Task<TurnoCajaResponse> CerrarAsync(
        Guid id,
        CerrarTurnoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var turno = await context.TurnosCaja
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Turno no encontrado.");

        if (turno.Estado != TurnoCajaEstados.Abierto)
            throw new BusinessException("El turno no está abierto.");

        var userId = currentUser.UserId
            ?? throw new BusinessException("Usuario no autenticado.");

        var efectivoEsperado = await CalcularEfectivoEsperadoAsync(id, cancellationToken);

        if (Math.Abs(request.MontoContado - efectivoEsperado) > 0.009m
            && string.IsNullOrWhiteSpace(request.ObservacionCierre))
        {
            throw new BusinessException("Debe indicar observación cuando hay diferencia en el cierre.");
        }

        turno.MontoEsperado = efectivoEsperado;
        turno.MontoContado = request.MontoContado;
        turno.Diferencia = Math.Round(request.MontoContado - efectivoEsperado, 2, MidpointRounding.AwayFromZero);
        turno.FechaCierre = DateTime.UtcNow;
        turno.EmpleadoCierreId = userId;
        turno.ObservacionCierre = string.IsNullOrWhiteSpace(request.ObservacionCierre)
            ? null
            : request.ObservacionCierre.Trim();
        turno.Estado = TurnoCajaEstados.Cerrado;
        turno.UpdatedAt = DateTime.UtcNow;
        turno.UpdatedBy = currentUser.UserName;

        await context.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Turno no encontrado.");
    }

    public async Task<PagedResult<TurnoCajaResponse>> GetPagedAsync(
        TurnoCajaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.TurnosCaja.AsNoTracking().AsQueryable();

        if (request.CajaId.HasValue)
            query = query.Where(x => x.CajaId == request.CajaId.Value);

        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());

        if (request.EmpleadoId.HasValue)
            query = query.Where(x => x.EmpleadoAperturaId == request.EmpleadoId.Value);

        var page = await ProjectTurnos(query.OrderByDescending(x => x.FechaApertura))
            .ToPagedResultAsync(request, cancellationToken);

        return await WithEmpleadoNombresAsync(page, cancellationToken);
    }

    public async Task<TurnoCajaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var turno = await ProjectTurnos(
                context.TurnosCaja.AsNoTracking().Where(x => x.Id == id))
            .FirstOrDefaultAsync(cancellationToken);

        if (turno is null)
            return null;

        var nombres = await ResolveEmpleadoNombresAsync(
            [turno.EmpleadoAperturaId, turno.EmpleadoCierreId],
            cancellationToken);

        return EnrichNombre(turno, nombres);
    }

    private static IQueryable<TurnoCajaResponse> ProjectTurnos(IQueryable<TurnoCaja> turnos) =>
        turnos.Select(t => new TurnoCajaResponse(
            t.Id,
            t.CajaId,
            t.Caja.Codigo,
            t.Caja.Nombre,
            t.EmpleadoAperturaId,
            null,
            t.EmpleadoCierreId,
            null,
            t.FechaApertura,
            t.FechaCierre,
            t.MontoInicial,
            t.MontoEsperado,
            t.MontoContado,
            t.Diferencia,
            t.Estado,
            t.ObservacionApertura,
            t.ObservacionCierre));

    private async Task<PagedResult<TurnoCajaResponse>> WithEmpleadoNombresAsync(
        PagedResult<TurnoCajaResponse> page,
        CancellationToken cancellationToken)
    {
        if (page.Items.Count == 0)
            return page;

        var ids = page.Items
            .SelectMany(x => new Guid?[] { x.EmpleadoAperturaId, x.EmpleadoCierreId })
            .ToList();

        var nombres = await ResolveEmpleadoNombresAsync(ids, cancellationToken);
        var enriched = page.Items.Select(x => EnrichNombre(x, nombres)).ToList();

        return new PagedResult<TurnoCajaResponse>(
            enriched,
            page.TotalRecords,
            page.Page,
            page.PageSize);
    }

    private async Task<Dictionary<Guid, string>> ResolveEmpleadoNombresAsync(
        IEnumerable<Guid?> ids,
        CancellationToken cancellationToken)
    {
        var idList = ids
            .Where(x => x.HasValue && x.Value != Guid.Empty)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        if (idList.Count == 0)
            return [];

        var result = new Dictionary<Guid, string>();

        // Los turnos guardan UserId (seguridad.usuarios) en EmpleadoAperturaId / EmpleadoCierreId.
        var usuarios = await context.Set<UsuarioLookup>().AsNoTracking()
            .Where(x => idList.Contains(x.Id))
            .Select(x => new { x.Id, x.NombreCompleto, x.PersonaId })
            .ToListAsync(cancellationToken);

        var personaIds = usuarios
            .Where(x => x.PersonaId.HasValue)
            .Select(x => x.PersonaId!.Value)
            .Distinct()
            .ToList();

        Dictionary<Guid, string> nombresPorPersona = [];
        if (personaIds.Count > 0)
        {
            nombresPorPersona = await context.Set<Persona>().AsNoTracking()
                .Where(x => personaIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    Nombre = (x.Nombres + " " + x.ApellidoPaterno + " " + x.ApellidoMaterno).Trim(),
                })
                .ToDictionaryAsync(x => x.Id, x => x.Nombre, cancellationToken);
        }

        foreach (var usuario in usuarios)
        {
            string? nombre = null;
            if (usuario.PersonaId is Guid personaId
                && nombresPorPersona.TryGetValue(personaId, out var desdePersona)
                && !string.IsNullOrWhiteSpace(desdePersona))
            {
                nombre = desdePersona;
            }
            else if (!string.IsNullOrWhiteSpace(usuario.NombreCompleto))
            {
                nombre = usuario.NombreCompleto.Trim();
            }

            if (!string.IsNullOrWhiteSpace(nombre))
                result[usuario.Id] = nombre;
        }

        // Fallback si algún Id fuera realmente Empleado.Id (no UserId).
        var missing = idList.Where(id => !result.ContainsKey(id)).ToList();
        if (missing.Count > 0)
        {
            var desdeEmpleado = await (
                from e in context.Set<Empleado>().AsNoTracking()
                join p in context.Set<Persona>().AsNoTracking() on e.PersonaId equals p.Id
                where missing.Contains(e.Id)
                select new
                {
                    e.Id,
                    Nombre = (p.Nombres + " " + p.ApellidoPaterno + " " + p.ApellidoMaterno).Trim(),
                })
                .ToListAsync(cancellationToken);

            foreach (var row in desdeEmpleado)
            {
                if (!string.IsNullOrWhiteSpace(row.Nombre))
                    result[row.Id] = row.Nombre;
            }
        }

        return result;
    }

    private static TurnoCajaResponse EnrichNombre(
        TurnoCajaResponse turno,
        IReadOnlyDictionary<Guid, string> nombres)
    {
        nombres.TryGetValue(turno.EmpleadoAperturaId, out var apertura);
        string? cierre = null;
        if (turno.EmpleadoCierreId is Guid cierreId)
            nombres.TryGetValue(cierreId, out cierre);

        return turno with
        {
            EmpleadoAperturaNombre = string.IsNullOrWhiteSpace(apertura) ? null : apertura,
            EmpleadoCierreNombre = string.IsNullOrWhiteSpace(cierre) ? null : cierre,
        };
    }

    private async Task<decimal> CalcularEfectivoEsperadoAsync(Guid turnoId, CancellationToken cancellationToken)
    {
        var movimientos = await context.MovimientosCaja.AsNoTracking()
            .Where(x => x.TurnoCajaId == turnoId && x.Estado == MovimientoCajaEstados.Confirmado)
            .Select(x => new
            {
                x.TipoMovimiento,
                x.Importe,
                EsEfectivo = x.MetodoPago != null && x.MetodoPago.EsEfectivo,
                EsFondo = x.ConceptoCaja.Codigo == ConceptoFondoInicial,
            })
            .ToListAsync(cancellationToken);

        var turno = await context.TurnosCaja.AsNoTracking()
            .Where(x => x.Id == turnoId)
            .Select(x => x.MontoInicial)
            .FirstAsync(cancellationToken);

        var tieneFondoMovimiento = movimientos.Any(x => x.EsFondo);
        var baseInicial = tieneFondoMovimiento ? 0m : turno;

        var ingresos = movimientos
            .Where(x => x.TipoMovimiento == TipoMovimientoCaja.Ingreso && (x.EsEfectivo || x.EsFondo))
            .Sum(x => x.Importe);
        var egresos = movimientos
            .Where(x => x.TipoMovimiento == TipoMovimientoCaja.Egreso && x.EsEfectivo)
            .Sum(x => x.Importe);

        return Math.Round(baseInicial + ingresos - egresos, 2, MidpointRounding.AwayFromZero);
    }
}
