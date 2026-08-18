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

    public async Task ValidarMetodosPagoAsync(
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

    public async Task ValidarMonedasAsync(
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

    public async Task ValidarCuentasBancariasAsync(
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
}
