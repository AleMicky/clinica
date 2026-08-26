using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Clinica.Api.Modules.Parametros.Banco.Entity;
using Clinica.Api.Modules.Parametros.MetodoPago.Entity;
using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Cajas.Cobro.Services;

public sealed class CobroDetalleService(AppDbContext dbContext)
{
    private AppDbContext DbContext { get; } = dbContext;

    // ============================================================
    // VALIDAR TODO
    // ============================================================

    public async Task ValidarAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken = default)
    {
        ValidarDatos(detalles);

        await ValidarMetodosPagoAsync(
            detalles,
            cancellationToken);

        await ValidarMonedasAsync(
            detalles,
            cancellationToken);

        await ValidarCuentasBancariasAsync(
            detalles,
            cancellationToken);
    }

    // ============================================================
    // VALIDACIONES BÁSICAS
    // ============================================================

    private static void ValidarDatos(
        IReadOnlyCollection<CobroDetalleRequest> detalles)
    {
        if (detalles.Count == 0)
        {
            throw new ConflictException(
                "Debe registrar al menos una forma de pago.");
        }

        foreach (var detalle in detalles)
        {
            if (detalle.MetodoPagoId <= 0)
            {
                throw new ConflictException(
                    "El método de pago es obligatorio.");
            }

            if (detalle.MonedaId <= 0)
            {
                throw new ConflictException(
                    "La moneda es obligatoria.");
            }

            if (detalle.CuentaBancariaId.HasValue &&
                detalle.CuentaBancariaId.Value <= 0)
            {
                throw new ConflictException(
                    "La cuenta bancaria no es válida.");
            }

            if (detalle.Monto <= 0)
            {
                throw new ConflictException(
                    "El monto del detalle debe ser mayor a cero.");
            }

            if (detalle.TipoCambio <= 0)
            {
                throw new ConflictException(
                    "El tipo de cambio debe ser mayor a cero.");
            }
        }
    }

    // ============================================================
    // MÉTODOS DE PAGO
    // ============================================================

    public async Task ValidarMetodosPagoAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken = default)
    {
        var ids = detalles
            .Select(x => x.MetodoPagoId)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return;

        var existentes = await DbContext
            .Set<MetodoPago>()
            .AsNoTracking()
            .Where(x =>
                ids.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltantes = ids
            .Except(existentes)
            .ToList();

        if (faltantes.Count > 0)
        {
            throw new NotFoundException(
                "MetodoPago",
                faltantes[0]);
        }
    }

    // ============================================================
    // MONEDAS
    // ============================================================

    public async Task ValidarMonedasAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken = default)
    {
        var ids = detalles
            .Select(x => x.MonedaId)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return;

        var existentes = await DbContext
            .Set<Moneda>()
            .AsNoTracking()
            .Where(x =>
                ids.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltantes = ids
            .Except(existentes)
            .ToList();

        if (faltantes.Count > 0)
        {
            throw new NotFoundException(
                "Moneda",
                faltantes[0]);
        }
    }

    // ============================================================
    // CUENTAS BANCARIAS
    // ============================================================

    public async Task ValidarCuentasBancariasAsync(
        IReadOnlyCollection<CobroDetalleRequest> detalles,
        CancellationToken cancellationToken = default)
    {
        var ids = detalles
            .Where(x => x.CuentaBancariaId.HasValue)
            .Select(x => x.CuentaBancariaId!.Value)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return;

        var existentes = await DbContext
            .Set<CuentaBancaria>()
            .AsNoTracking()
            .Where(x =>
                ids.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltantes = ids
            .Except(existentes)
            .ToList();

        if (faltantes.Count > 0)
        {
            throw new NotFoundException(
                "CuentaBancaria",
                faltantes[0]);
        }
    }
}