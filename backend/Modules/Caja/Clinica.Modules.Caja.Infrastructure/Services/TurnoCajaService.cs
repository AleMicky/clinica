using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Turnos;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
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

        var usuarioConTurno = await context.TurnosCaja.AnyAsync(
            x => x.UsuarioAperturaId == userId && x.Estado == TurnoCajaEstados.Abierto,
            cancellationToken);
        if (usuarioConTurno)
            throw new BusinessException("El usuario ya tiene un turno abierto.");

        var turno = new TurnoCaja
        {
            Id = Guid.NewGuid(),
            CajaId = caja.Id,
            UsuarioAperturaId = userId,
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
            .Where(x => x.UsuarioAperturaId == userId && x.Estado == TurnoCajaEstados.Abierto)
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
        turno.UsuarioCierreId = userId;
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

        if (request.UsuarioId.HasValue)
            query = query.Where(x => x.UsuarioAperturaId == request.UsuarioId.Value);

        return await query
            .OrderByDescending(x => x.FechaApertura)
            .Select(x => new TurnoCajaResponse(
                x.Id,
                x.CajaId,
                x.Caja.Codigo,
                x.Caja.Nombre,
                x.UsuarioAperturaId,
                x.UsuarioCierreId,
                x.FechaApertura,
                x.FechaCierre,
                x.MontoInicial,
                x.MontoEsperado,
                x.MontoContado,
                x.Diferencia,
                x.Estado,
                x.ObservacionApertura,
                x.ObservacionCierre))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<TurnoCajaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.TurnosCaja.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new TurnoCajaResponse(
                x.Id,
                x.CajaId,
                x.Caja.Codigo,
                x.Caja.Nombre,
                x.UsuarioAperturaId,
                x.UsuarioCierreId,
                x.FechaApertura,
                x.FechaCierre,
                x.MontoInicial,
                x.MontoEsperado,
                x.MontoContado,
                x.Diferencia,
                x.Estado,
                x.ObservacionApertura,
                x.ObservacionCierre))
            .FirstOrDefaultAsync(cancellationToken);
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

        // Si el fondo inicial ya está como movimiento, no sumar MontoInicial aparte.
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
