using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;
using ExistenciaPartidaEntity = Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity.ExistenciaPartida;
using PartidaEntity = Clinica.Api.Modules.Almacenes.PartidaInventario.Entity.PartidaInventario;


namespace Clinica.Api.Modules.Almacenes.Existencia.Services;

public interface IExistenciaMovimientoService
{
    Task ConfirmarEntradaAsync(int almacenId, MovimientoInventarioDetalle detalle,
        CancellationToken cancellationToken = default);

    Task ConfirmarSalidaAsync(int almacenId, MovimientoInventarioDetalle detalle,
        CancellationToken cancellationToken = default);
}
public sealed class ExistenciaMovimientoService(AppDbContext dbContext)
    : IExistenciaMovimientoService
{
    public async Task ConfirmarEntradaAsync(int almacenId,
        MovimientoInventarioDetalle detalle, CancellationToken cancellationToken = default)
    {
        if (detalle.Cantidad <= 0)
            throw new BusinessException("La cantidad de entrada debe ser mayor a cero.");
        if (detalle.CostoUnitario is null || detalle.CostoUnitario < 0)
            throw new BusinessException("La entrada debe tener un costo unitario válido.");


        var existencia = await dbContext.Existencias.FirstOrDefaultAsync(
            x => x.AlmacenId == almacenId && x.ProductoId == detalle.ProductoId && x.Activo,
            cancellationToken);

        if (existencia is null)
        {
            existencia = new ExistenciaEntity
            {
                AlmacenId = almacenId,
                ProductoId = detalle.ProductoId,
                Cantidad = 0m,
                CantidadReservada = 0m,
                CostoPromedio = 0m
            };
            dbContext.Existencias.Add(existencia);
        }

        decimal cantidadNueva = existencia.Cantidad + detalle.Cantidad;
        decimal valorAnterior = existencia.Cantidad * existencia.CostoPromedio;
        decimal valorEntrada = detalle.Cantidad * detalle.CostoUnitario.Value;
        existencia.CostoPromedio = (valorAnterior + valorEntrada) / cantidadNueva;
        existencia.Cantidad = cantidadNueva;

        // Cada detalle confirmado de entrada crea una partida. Su código permite
        // identificar el detalle original sin modificar las entidades actuales.
        var partida = new PartidaEntity
        {
            ProductoId = detalle.ProductoId,
            NumeroPartida = $"MOVDET-{detalle.Id:D10}",
            FechaVencimiento = null,
            CostoUnitario = detalle.CostoUnitario.Value
        };
        dbContext.Set<PartidaEntity>().Add(partida);
        dbContext.Set<ExistenciaPartidaEntity>().Add(new ExistenciaPartidaEntity
        {
            Existencia = existencia,
            PartidaInventario = partida,
            Cantidad = detalle.Cantidad,
            CantidadReservada = 0m
        });
    }

    public async Task ConfirmarSalidaAsync(int almacenId,
        MovimientoInventarioDetalle detalle, CancellationToken cancellationToken = default)
    {
        if (detalle.Cantidad <= 0)
            throw new BusinessException("La cantidad de salida debe ser mayor a cero.");

        var existencia = await dbContext.Existencias.FirstOrDefaultAsync(
            x => x.AlmacenId == almacenId && x.ProductoId == detalle.ProductoId && x.Activo,
            cancellationToken);
        if (existencia is null || existencia.CantidadDisponible < detalle.Cantidad)
            throw new BusinessException("Stock disponible insuficiente.");

        var partidas = await dbContext.Set<ExistenciaPartidaEntity>()
            .Include(x => x.PartidaInventario)
            .Where(x => x.ExistenciaId == existencia.Id && x.Activo &&
                        x.Cantidad > x.CantidadReservada)
            .OrderByDescending(x => detalle.PartidaInventarioId.HasValue && x.PartidaInventarioId == detalle.PartidaInventarioId.Value)
            .ThenBy(x => x.PartidaInventario.FechaVencimiento ?? DateOnly.MaxValue)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);

        decimal pendiente = detalle.Cantidad;
        foreach (var saldo in partidas)
        {
            if (pendiente == 0m) break;
            var esLoteSeleccionado = detalle.PartidaInventarioId.HasValue &&
                                     saldo.PartidaInventarioId == detalle.PartidaInventarioId.Value;
            var vencimiento = saldo.PartidaInventario.FechaVencimiento;
            if (!esLoteSeleccionado && vencimiento.HasValue && vencimiento.Value < DateOnly.FromDateTime(DateTime.UtcNow))
                continue;
            decimal salida = Math.Min(pendiente, saldo.CantidadDisponible);
            if (salida <= 0m) continue;
            saldo.Cantidad -= salida;
            pendiente -= salida;
            // PENDIENTE DE TRAZABILIDAD DE SALIDA:
            // persistir MovimientoInventarioPartida(detalle.Id, saldo.PartidaInventarioId, salida).
            // Sin esa relación NO habilitar anulaciones de salidas.
        }
        if (partidas.Count > 0 && pendiente > 0m)
            throw new BusinessException("No hay suficiente stock despachable en partidas.");

        detalle.CostoUnitario = existencia.CostoPromedio;
        existencia.Cantidad -= detalle.Cantidad;
        // PMP no cambia al salir mercancía.
    }
}
