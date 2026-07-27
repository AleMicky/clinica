using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Movimientos;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class MovimientoCajaService(
    CajaDbContext context,
    ICurrentUser currentUser,
    ICorrelativoService correlativoService) : IMovimientoCajaService
{
    public Task<MovimientoCajaResponse> RegistrarIngresoManualAsync(
        RegistrarMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
        => RegistrarManualAsync(request, TipoMovimientoCaja.Ingreso, cancellationToken);

    public Task<MovimientoCajaResponse> RegistrarEgresoManualAsync(
        RegistrarMovimientoCajaRequest request,
        CancellationToken cancellationToken = default)
        => RegistrarManualAsync(request, TipoMovimientoCaja.Egreso, cancellationToken);

    public async Task<PagedResult<MovimientoCajaResponse>> GetPagedAsync(
        MovimientoCajaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.MovimientosCaja.AsNoTracking().AsQueryable();

        if (request.TurnoCajaId.HasValue)
            query = query.Where(x => x.TurnoCajaId == request.TurnoCajaId.Value);

        if (!string.IsNullOrWhiteSpace(request.TipoMovimiento))
            query = query.Where(x => x.TipoMovimiento == request.TipoMovimiento.Trim().ToUpperInvariant());

        if (request.ConceptoCajaId.HasValue)
            query = query.Where(x => x.ConceptoCajaId == request.ConceptoCajaId.Value);

        if (request.MetodoPagoId.HasValue)
            query = query.Where(x => x.MetodoPagoId == request.MetodoPagoId.Value);

        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());

        if (request.FechaDesde.HasValue)
            query = query.Where(x => x.Fecha >= request.FechaDesde.Value);

        if (request.FechaHasta.HasValue)
            query = query.Where(x => x.Fecha <= request.FechaHasta.Value);

        return await query
            .OrderByDescending(x => x.Fecha)
            .Select(x => new MovimientoCajaResponse(
                x.Id,
                x.Numero,
                x.TurnoCajaId,
                x.ConceptoCajaId,
                x.ConceptoCaja.Codigo,
                x.ConceptoCaja.Nombre,
                x.TipoMovimiento,
                x.Fecha,
                x.Importe,
                x.MetodoPagoId,
                x.MetodoPago != null ? x.MetodoPago.Codigo : null,
                x.PagoId,
                x.Descripcion,
                x.Estado,
                x.CreatedBy))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<ResumenTurnoCajaResponse> GetResumenTurnoAsync(
        Guid turnoId,
        CancellationToken cancellationToken = default)
    {
        var turno = await context.TurnosCaja.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == turnoId, cancellationToken)
            ?? throw new NotFoundException("Turno no encontrado.");

        var movimientos = await context.MovimientosCaja.AsNoTracking()
            .Where(x => x.TurnoCajaId == turnoId && x.Estado == MovimientoCajaEstados.Confirmado)
            .Select(x => new
            {
                x.TipoMovimiento,
                x.Importe,
                EsEfectivo = x.MetodoPago != null && x.MetodoPago.EsEfectivo,
                EsFondo = x.ConceptoCaja.Codigo == TurnoCajaService.ConceptoFondoInicial,
            })
            .ToListAsync(cancellationToken);

        var ingresos = movimientos
            .Where(x => x.TipoMovimiento == TipoMovimientoCaja.Ingreso && !x.EsFondo)
            .Sum(x => x.Importe);
        var egresos = movimientos
            .Where(x => x.TipoMovimiento == TipoMovimientoCaja.Egreso)
            .Sum(x => x.Importe);
        var ingresosEfectivo = movimientos
            .Where(x => x.TipoMovimiento == TipoMovimientoCaja.Ingreso && x.EsEfectivo && !x.EsFondo)
            .Sum(x => x.Importe);
        var egresosEfectivo = movimientos
            .Where(x => x.TipoMovimiento == TipoMovimientoCaja.Egreso && x.EsEfectivo)
            .Sum(x => x.Importe);

        var efectivoEsperado = Math.Round(
            turno.MontoInicial + ingresosEfectivo - egresosEfectivo,
            2,
            MidpointRounding.AwayFromZero);

        return new ResumenTurnoCajaResponse(
            turnoId,
            turno.MontoInicial,
            ingresos,
            egresos,
            ingresosEfectivo,
            egresosEfectivo,
            efectivoEsperado,
            movimientos.Count);
    }

    private async Task<MovimientoCajaResponse> RegistrarManualAsync(
        RegistrarMovimientoCajaRequest request,
        string tipoEsperado,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId
            ?? throw new BusinessException("Usuario no autenticado.");

        var turno = await context.TurnosCaja
            .FirstOrDefaultAsync(
                x => x.UsuarioAperturaId == userId && x.Estado == TurnoCajaEstados.Abierto,
                cancellationToken)
            ?? throw new BusinessException("No hay un turno de caja abierto.");

        var concepto = await context.ConceptosCaja
            .FirstOrDefaultAsync(x => x.Id == request.ConceptoCajaId && x.Activo, cancellationToken)
            ?? throw new NotFoundException("Concepto de caja no encontrado.");

        if (concepto.TipoMovimiento != tipoEsperado)
            throw new BusinessException($"El concepto no corresponde a un {tipoEsperado.ToLowerInvariant()}.");

        if (concepto.Codigo == TurnoCajaService.ConceptoFondoInicial)
            throw new BusinessException("El fondo inicial solo se registra al abrir el turno.");

        if (request.MetodoPagoId.HasValue)
        {
            var metodoExists = await context.MetodosPago.AnyAsync(
                x => x.Id == request.MetodoPagoId && x.Activo,
                cancellationToken);
            if (!metodoExists)
                throw new NotFoundException("Método de pago no encontrado.");
        }

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest("CAJA_MOVIMIENTO", Prefijo: "MOV-", Longitud: 6),
            cancellationToken);

        var movimiento = new MovimientoCaja
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            TurnoCajaId = turno.Id,
            ConceptoCajaId = concepto.Id,
            TipoMovimiento = tipoEsperado,
            Fecha = DateTime.UtcNow,
            Importe = Math.Round(request.Importe, 2, MidpointRounding.AwayFromZero),
            MetodoPagoId = request.MetodoPagoId,
            Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim(),
            Estado = MovimientoCajaEstados.Confirmado,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserName,
        };

        context.MovimientosCaja.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);

        return await context.MovimientosCaja.AsNoTracking()
            .Where(x => x.Id == movimiento.Id)
            .Select(x => new MovimientoCajaResponse(
                x.Id,
                x.Numero,
                x.TurnoCajaId,
                x.ConceptoCajaId,
                x.ConceptoCaja.Codigo,
                x.ConceptoCaja.Nombre,
                x.TipoMovimiento,
                x.Fecha,
                x.Importe,
                x.MetodoPagoId,
                x.MetodoPago != null ? x.MetodoPago.Codigo : null,
                x.PagoId,
                x.Descripcion,
                x.Estado,
                x.CreatedBy))
            .FirstAsync(cancellationToken);
    }
}
