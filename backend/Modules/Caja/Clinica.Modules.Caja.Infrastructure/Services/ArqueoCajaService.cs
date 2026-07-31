using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Arqueos;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class ArqueoCajaService(
    CajaDbContext context,
    ICurrentUser currentUser,
    IMovimientoCajaService movimientoCajaService) : IArqueoCajaService
{
    public async Task<ArqueoCajaResponse> CalcularAsync(Guid turnoId, CancellationToken cancellationToken = default)
    {
        var resumen = await movimientoCajaService.GetResumenTurnoAsync(turnoId, cancellationToken);
        var existente = await context.ArqueosCaja.AsNoTracking()
            .FirstOrDefaultAsync(x => x.TurnoCajaId == turnoId, cancellationToken);

        if (existente is not null)
            return Map(existente);

        return new ArqueoCajaResponse(
            Guid.Empty,
            turnoId,
            DateTime.UtcNow,
            resumen.MontoInicial,
            resumen.IngresosEfectivo,
            resumen.EgresosEfectivo,
            resumen.EfectivoEsperado,
            0,
            0,
            null,
            currentUser.UserId ?? Guid.Empty);
    }

    public async Task<ArqueoCajaResponse?> GetByTurnoAsync(Guid turnoId, CancellationToken cancellationToken = default)
    {
        var arqueo = await context.ArqueosCaja.AsNoTracking()
            .FirstOrDefaultAsync(x => x.TurnoCajaId == turnoId, cancellationToken);
        return arqueo is null ? null : Map(arqueo);
    }

    public async Task<ArqueoCajaResponse> CerrarTurnoAsync(
        Guid turnoId,
        CerrarArqueoCajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new BusinessException("Usuario no autenticado.");

        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var turno = await context.TurnosCaja
            .FirstOrDefaultAsync(x => x.Id == turnoId, cancellationToken)
            ?? throw new NotFoundException("Turno no encontrado.");

        if (turno.Estado != TurnoCajaEstados.Abierto)
            throw new BusinessException("El turno no está abierto.");

        var existeArqueo = await context.ArqueosCaja.AnyAsync(x => x.TurnoCajaId == turnoId, cancellationToken);
        if (existeArqueo)
            throw new BusinessException("El turno ya tiene un arqueo registrado.");

        var resumen = await movimientoCajaService.GetResumenTurnoAsync(turnoId, cancellationToken);
        var diferencia = Math.Round(request.MontoContado - resumen.EfectivoEsperado, 2, MidpointRounding.AwayFromZero);

        if (Math.Abs(diferencia) > 0.009m && string.IsNullOrWhiteSpace(request.Observaciones))
            throw new BusinessException("Debe indicar observación cuando existe diferencia en el arqueo.");

        var arqueo = new ArqueoCaja
        {
            Id = Guid.NewGuid(),
            TurnoCajaId = turnoId,
            Fecha = DateTime.UtcNow,
            MontoInicial = resumen.MontoInicial,
            IngresosEfectivo = resumen.IngresosEfectivo,
            EgresosEfectivo = resumen.EgresosEfectivo,
            MontoEsperado = resumen.EfectivoEsperado,
            MontoContado = request.MontoContado,
            Diferencia = diferencia,
            Observaciones = string.IsNullOrWhiteSpace(request.Observaciones) ? null : request.Observaciones.Trim(),
            RealizadoPor = userId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserName,
        };

        context.ArqueosCaja.Add(arqueo);

        turno.MontoEsperado = resumen.EfectivoEsperado;
        turno.MontoContado = request.MontoContado;
        turno.Diferencia = diferencia;
        turno.FechaCierre = DateTime.UtcNow;
        turno.EmpleadoCierreId = userId;
        turno.ObservacionCierre = arqueo.Observaciones;
        turno.Estado = TurnoCajaEstados.Cerrado;
        turno.UpdatedAt = DateTime.UtcNow;
        turno.UpdatedBy = currentUser.UserName;

        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return Map(arqueo);
    }

    private static ArqueoCajaResponse Map(ArqueoCaja x) => new(
        x.Id,
        x.TurnoCajaId,
        x.Fecha,
        x.MontoInicial,
        x.IngresosEfectivo,
        x.EgresosEfectivo,
        x.MontoEsperado,
        x.MontoContado,
        x.Diferencia,
        x.Observaciones,
        x.RealizadoPor);
}
