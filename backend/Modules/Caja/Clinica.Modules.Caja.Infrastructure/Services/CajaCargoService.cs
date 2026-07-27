using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cargos;
using Clinica.Modules.Caja.Application.Cuentas;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class CajaCargoService(
    CajaDbContext context,
    ICorrelativoService correlativoService) : ICajaCargoService
{
    public const string CorrelativoCodigo = "CAJA_CUENTA";

    public async Task<CuentaResponse> AgregarCargosAsync(
        AgregarCargosRequest request,
        CancellationToken cancellationToken = default)
    {
        var modulo = request.ModuloOrigen.Trim();
        var entidad = request.EntidadOrigen.Trim();

        var cuenta = await context.Cuentas
            .Include(x => x.Cargos)
            .Include(x => x.Pagos)
            .FirstOrDefaultAsync(
                x => x.ModuloOrigen == modulo
                    && x.EntidadOrigen == entidad
                    && x.ReferenciaId == request.ReferenciaId
                    && x.Estado != CuentaEstados.Anulada,
                cancellationToken);

        if (cuenta is not null && cuenta.Estado == CuentaEstados.Pagada)
            throw new BusinessException("La cuenta de origen ya está pagada; no se pueden agregar cargos.");

        if (cuenta is null)
        {
            var correlativo = await correlativoService.GenerarAsync(
                new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "CAJ-", Longitud: 6),
                cancellationToken);

            cuenta = new Cuenta
            {
                Id = Guid.NewGuid(),
                Numero = correlativo.NumeroFormateado,
                PacienteId = request.PacienteId,
                ModuloOrigen = modulo,
                EntidadOrigen = entidad,
                ReferenciaId = request.ReferenciaId,
                WorkflowInstanceId = request.WorkflowInstanceId,
                Estado = CuentaEstados.Abierta,
                Observaciones = request.Observaciones,
                CreatedAt = DateTime.UtcNow,
            };

            context.Cuentas.Add(cuenta);
        }
        else
        {
            if (request.WorkflowInstanceId.HasValue)
                cuenta.WorkflowInstanceId = request.WorkflowInstanceId;

            if (!string.IsNullOrWhiteSpace(request.Observaciones))
                cuenta.Observaciones = request.Observaciones;

            cuenta.UpdatedAt = DateTime.UtcNow;
        }

        foreach (var linea in request.Lineas)
        {
            if (linea.ReferenciaLineaId.HasValue)
            {
                var exists = cuenta.Cargos.Any(c =>
                    !c.IsDeleted
                    && c.ReferenciaLineaId == linea.ReferenciaLineaId
                    && c.ModuloOrigen == modulo
                    && c.EntidadOrigen == entidad
                    && c.ReferenciaId == request.ReferenciaId);

                if (exists)
                    continue;
            }

            var montoTotal = Math.Round(linea.Cantidad * linea.MontoUnitario, 2, MidpointRounding.AwayFromZero);

            cuenta.Cargos.Add(new Cargo
            {
                Id = Guid.NewGuid(),
                Concepto = linea.Concepto.Trim(),
                Codigo = string.IsNullOrWhiteSpace(linea.Codigo) ? null : linea.Codigo.Trim(),
                Cantidad = linea.Cantidad,
                MontoUnitario = linea.MontoUnitario,
                MontoTotal = montoTotal,
                ModuloOrigen = modulo,
                EntidadOrigen = entidad,
                ReferenciaId = request.ReferenciaId,
                ReferenciaLineaId = linea.ReferenciaLineaId,
                CreatedAt = DateTime.UtcNow,
            });
        }

        RecalcularTotales(cuenta);
        await context.SaveChangesAsync(cancellationToken);

        return await GetMappedAsync(cuenta.Id, cancellationToken)
            ?? throw new NotFoundException("Cuenta no encontrada tras agregar cargos.");
    }

    public async Task<CuentaResponse?> GetByReferenciaAsync(
        string moduloOrigen,
        string entidadOrigen,
        Guid referenciaId,
        CancellationToken cancellationToken = default)
    {
        var cuenta = await context.Cuentas
            .AsNoTracking()
            .Where(x => x.ModuloOrigen == moduloOrigen.Trim()
                && x.EntidadOrigen == entidadOrigen.Trim()
                && x.ReferenciaId == referenciaId
                && x.Estado != CuentaEstados.Anulada)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (cuenta == Guid.Empty)
            return null;

        return await GetMappedAsync(cuenta, cancellationToken);
    }

    public async Task<bool> EstaPagadaAsync(
        string moduloOrigen,
        string entidadOrigen,
        Guid referenciaId,
        CancellationToken cancellationToken = default)
    {
        return await context.Cuentas
            .AsNoTracking()
            .AnyAsync(
                x => x.ModuloOrigen == moduloOrigen.Trim()
                    && x.EntidadOrigen == entidadOrigen.Trim()
                    && x.ReferenciaId == referenciaId
                    && x.Estado == CuentaEstados.Pagada,
                cancellationToken);
    }

    internal static void RecalcularTotales(Cuenta cuenta)
    {
        cuenta.TotalCargos = cuenta.Cargos.Where(c => !c.IsDeleted).Sum(c => c.MontoTotal);
        cuenta.TotalPagado = cuenta.Pagos
            .Where(p => !p.IsDeleted && p.Estado == PagoEstados.Confirmado)
            .Sum(p => p.Monto);
        cuenta.Saldo = Math.Round(cuenta.TotalCargos - cuenta.TotalPagado, 2, MidpointRounding.AwayFromZero);

        if (cuenta.Estado == CuentaEstados.Anulada)
            return;

        if (cuenta.Saldo <= 0 && cuenta.TotalCargos > 0)
            cuenta.Estado = CuentaEstados.Pagada;
        else if (cuenta.TotalPagado > 0)
            cuenta.Estado = CuentaEstados.Parcial;
        else
            cuenta.Estado = CuentaEstados.Abierta;
    }

    private async Task<CuentaResponse?> GetMappedAsync(Guid id, CancellationToken cancellationToken)
    {
        var cuenta = await context.Cuentas
            .AsNoTracking()
            .Include(x => x.Cargos)
            .Include(x => x.Pagos)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return cuenta is null ? null : MapCuenta(cuenta);
    }

    internal static CuentaResponse MapCuenta(Cuenta cuenta)
    {
        var cargos = cuenta.Cargos
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CargoResponse(
                c.Id,
                c.Concepto,
                c.Codigo,
                c.Cantidad,
                c.MontoUnitario,
                c.MontoTotal,
                c.ModuloOrigen,
                c.EntidadOrigen,
                c.ReferenciaId,
                c.ReferenciaLineaId,
                c.CreatedAt))
            .ToList();

        var pagos = cuenta.Pagos
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.FechaPago)
            .Select(p => new PagoResponse(
                p.Id,
                p.Numero,
                p.Monto,
                p.MetodoPago,
                p.Estado,
                p.FechaPago,
                p.Observaciones,
                p.CreatedAt))
            .ToList();

        return new CuentaResponse(
            cuenta.Id,
            cuenta.Numero,
            cuenta.PacienteId,
            cuenta.ModuloOrigen,
            cuenta.EntidadOrigen,
            cuenta.ReferenciaId,
            cuenta.WorkflowInstanceId,
            cuenta.Estado,
            cuenta.TotalCargos,
            cuenta.TotalPagado,
            cuenta.Saldo,
            cuenta.Observaciones,
            cuenta.CreatedAt,
            cuenta.UpdatedAt,
            cargos,
            pagos);
    }
}
