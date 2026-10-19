using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Kardex.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Enums;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.Kardex.Services;

public interface IKardexService
{
    Task<KardexReporteResponse> ObtenerKardexAsync(
        int productoId,
        int? almacenId,
        DateTime? fechaDesde,
        DateTime? fechaHasta,
        CancellationToken cancellationToken = default);
}

public sealed class KardexService(AppDbContext dbContext) : IKardexService
{
    public async Task<KardexReporteResponse> ObtenerKardexAsync(
        int productoId,
        int? almacenId,
        DateTime? fechaDesde,
        DateTime? fechaHasta,
        CancellationToken cancellationToken = default)
    {
        var producto = await dbContext.Productos
            .AsNoTracking()
            .Include(p => p.UnidadMedida)
            .FirstOrDefaultAsync(p => p.Id == productoId && p.Activo, cancellationToken)
            ?? throw new NotFoundException(nameof(ProductoEntity), productoId);

        string? almacenNombre = null;
        if (almacenId.HasValue)
        {
            var almacen = await dbContext.Almacenes
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == almacenId.Value && a.Activo, cancellationToken)
                ?? throw new NotFoundException("Almacen", almacenId.Value);

            almacenNombre = almacen.Nombre;
        }

        // Obtener la existencia actual
        var existenciaQuery = dbContext.Existencias
            .AsNoTracking()
            .Where(e => e.ProductoId == productoId && e.Activo);

        if (almacenId.HasValue)
        {
            existenciaQuery = existenciaQuery.Where(e => e.AlmacenId == almacenId.Value);
        }

        var existencias = await existenciaQuery.ToListAsync(cancellationToken);
        decimal stockActual = existencias.Sum(e => e.Cantidad);
        decimal valorTotalActual = existencias.Sum(e => e.Cantidad * e.CostoPromedio);
        decimal costoPromedioActual = stockActual > 0 ? valorTotalActual / stockActual : 0m;

        // Consultar movimientos confirmados
        var movimientosQuery = dbContext.MovimientosInventario
            .AsNoTracking()
            .Where(m => m.Activo && m.Estado == EstadoMovimientoInventario.Confirmado)
            .Where(m => m.Detalles.Any(d => d.ProductoId == productoId && d.Activo));

        if (almacenId.HasValue)
        {
            movimientosQuery = movimientosQuery.Where(m => m.AlmacenId == almacenId.Value);
        }

        if (fechaDesde.HasValue)
        {
            movimientosQuery = movimientosQuery.Where(m => m.FechaMovimiento >= fechaDesde.Value);
        }

        if (fechaHasta.HasValue)
        {
            movimientosQuery = movimientosQuery.Where(m => m.FechaMovimiento <= fechaHasta.Value);
        }

        var movimientos = await movimientosQuery
            .OrderBy(m => m.FechaMovimiento)
            .ThenBy(m => m.Id)
            .Include(m => m.TipoMovimientoInventario)
            .Include(m => m.Detalles.Where(d => d.ProductoId == productoId && d.Activo))
            .ToListAsync(cancellationToken);

        var items = new List<KardexMovimientoItem>();
        decimal saldoCantidad = 0m;
        decimal saldoTotal = 0m;

        foreach (var mov in movimientos)
        {
            var detalle = mov.Detalles.FirstOrDefault(d => d.ProductoId == productoId);
            if (detalle is null) continue;

            var naturaleza = mov.TipoMovimientoInventario?.Naturaleza ?? NaturalezaMovimiento.Entrada;
            decimal cantEntrada = 0m;
            decimal? costoEntrada = null;
            decimal totalEntrada = 0m;

            decimal cantSalida = 0m;
            decimal? costoSalida = null;
            decimal totalSalida = 0m;

            if (naturaleza == NaturalezaMovimiento.Entrada)
            {
                cantEntrada = detalle.Cantidad;
                costoEntrada = detalle.CostoUnitario ?? 0m;
                totalEntrada = cantEntrada * costoEntrada.Value;

                saldoCantidad += cantEntrada;
                saldoTotal += totalEntrada;
            }
            else
            {
                cantSalida = detalle.Cantidad;
                costoSalida = detalle.CostoUnitario ?? (saldoCantidad > 0 ? saldoTotal / saldoCantidad : 0m);
                totalSalida = cantSalida * costoSalida.Value;

                saldoCantidad -= cantSalida;
                saldoTotal = Math.Max(0m, saldoTotal - totalSalida);
            }

            decimal saldoCostoUnitario = saldoCantidad > 0 ? saldoTotal / saldoCantidad : 0m;

            items.Add(new KardexMovimientoItem(
                MovimientoId: mov.Id,
                NumeroDocumento: mov.Numero,
                Fecha: mov.FechaMovimiento,
                TipoMovimiento: mov.TipoMovimientoInventario?.Nombre ?? mov.TipoMovimientoInventario?.Codigo ?? "N/A",
                Naturaleza: naturaleza,
                ReferenciaTipo: mov.ReferenciaTipo,
                ReferenciaId: mov.ReferenciaId,
                CantidadEntrada: cantEntrada,
                CostoUnitarioEntrada: costoEntrada,
                TotalEntrada: totalEntrada,
                CantidadSalida: cantSalida,
                CostoUnitarioSalida: costoSalida,
                TotalSalida: totalSalida,
                SaldoCantidad: saldoCantidad,
                SaldoCostoUnitario: saldoCostoUnitario,
                SaldoTotal: saldoTotal
            ));
        }

        return new KardexReporteResponse(
            AlmacenId: almacenId,
            AlmacenNombre: almacenNombre,
            ProductoId: producto.Id,
            ProductoCodigo: producto.Codigo,
            ProductoNombre: producto.Nombre,
            UnidadMedida: producto.UnidadMedida?.Nombre ?? string.Empty,
            StockActual: stockActual,
            CostoPromedioActual: costoPromedioActual,
            ValorTotalActual: valorTotalActual,
            Movimientos: items
        );
    }
}
