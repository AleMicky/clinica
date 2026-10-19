using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.AlertasStock.Dtos;
using Clinica.Api.Modules.Almacenes.AlertasStock.Enums;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Almacenes.AlertasStock.Services;

public interface IAlertasStockService
{
    Task<List<AlertaStockResponse>> ObtenerAlertasAsync(
        int? almacenId,
        TipoAlertaStock? tipo,
        int diasVencimiento = 30,
        CancellationToken cancellationToken = default);
}

public sealed class AlertasStockService(AppDbContext dbContext) : IAlertasStockService
{
    public async Task<List<AlertaStockResponse>> ObtenerAlertasAsync(
        int? almacenId,
        TipoAlertaStock? tipo,
        int diasVencimiento = 30,
        CancellationToken cancellationToken = default)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var fechaLimite = hoy.AddDays(diasVencimiento);
        var alertas = new List<AlertaStockResponse>();

        // 1. Alertas de Sin Stock y Stock Bajo
        if (!tipo.HasValue || tipo == TipoAlertaStock.SinStock || tipo == TipoAlertaStock.StockBajo)
        {
            var existenciasQuery = dbContext.Existencias
                .AsNoTracking()
                .Include(e => e.Almacen)
                .Include(e => e.Producto)
                .Where(e => e.Activo && e.Producto.Activo);

            if (almacenId.HasValue)
            {
                existenciasQuery = existenciasQuery.Where(e => e.AlmacenId == almacenId.Value);
            }

            var existencias = await existenciasQuery.ToListAsync(cancellationToken);

            foreach (var e in existencias)
            {
                decimal disponible = e.Cantidad - e.CantidadReservada;

                if ((!tipo.HasValue || tipo == TipoAlertaStock.SinStock) && disponible <= 0)
                {
                    alertas.Add(new AlertaStockResponse(
                        Tipo: TipoAlertaStock.SinStock,
                        AlmacenId: e.AlmacenId,
                        ProductoId: e.ProductoId,
                        Producto: e.Producto.Nombre,
                        Cantidad: e.Cantidad,
                        CantidadReservada: e.CantidadReservada,
                        CantidadDisponible: disponible,
                        StockMinimo: e.Producto.StockMinimo,
                        FechaVencimiento: null,
                        DiasParaVencer: null,
                        AlmacenNombre: e.Almacen?.Nombre,
                        ProductoCodigo: e.Producto.Codigo
                    ));
                }
                else if ((!tipo.HasValue || tipo == TipoAlertaStock.StockBajo) &&
                         disponible > 0 &&
                         e.Producto.StockMinimo > 0 &&
                         disponible <= e.Producto.StockMinimo)
                {
                    alertas.Add(new AlertaStockResponse(
                        Tipo: TipoAlertaStock.StockBajo,
                        AlmacenId: e.AlmacenId,
                        ProductoId: e.ProductoId,
                        Producto: e.Producto.Nombre,
                        Cantidad: e.Cantidad,
                        CantidadReservada: e.CantidadReservada,
                        CantidadDisponible: disponible,
                        StockMinimo: e.Producto.StockMinimo,
                        FechaVencimiento: null,
                        DiasParaVencer: null,
                        AlmacenNombre: e.Almacen?.Nombre,
                        ProductoCodigo: e.Producto.Codigo
                    ));
                }
            }
        }

        // 2. Alertas de Vencimiento (Próximo a Vencer y Vencido)
        if (!tipo.HasValue || tipo == TipoAlertaStock.ProximoVencer || tipo == TipoAlertaStock.Vencido)
        {
            var partidasQuery = dbContext.ExistenciasPartidas
                .AsNoTracking()
                .Include(ep => ep.PartidaInventario)
                .Include(ep => ep.Existencia)
                    .ThenInclude(e => e.Almacen)
                .Include(ep => ep.Existencia)
                    .ThenInclude(e => e.Producto)
                .Where(ep => ep.Activo &&
                             ep.Cantidad > ep.CantidadReservada &&
                             ep.PartidaInventario.FechaVencimiento != null);

            if (almacenId.HasValue)
            {
                partidasQuery = partidasQuery.Where(ep => ep.Existencia.AlmacenId == almacenId.Value);
            }

            var partidas = await partidasQuery.ToListAsync(cancellationToken);

            foreach (var p in partidas)
            {
                var fVenc = p.PartidaInventario.FechaVencimiento!.Value;
                int dias = fVenc.DayNumber - hoy.DayNumber;
                decimal disponible = p.Cantidad - p.CantidadReservada;

                if ((!tipo.HasValue || tipo == TipoAlertaStock.Vencido) && fVenc < hoy)
                {
                    alertas.Add(new AlertaStockResponse(
                        Tipo: TipoAlertaStock.Vencido,
                        AlmacenId: p.Existencia.AlmacenId,
                        ProductoId: p.Existencia.ProductoId,
                        Producto: p.Existencia.Producto?.Nombre ?? "N/A",
                        Cantidad: p.Cantidad,
                        CantidadReservada: p.CantidadReservada,
                        CantidadDisponible: disponible,
                        StockMinimo: p.Existencia.Producto?.StockMinimo,
                        FechaVencimiento: fVenc,
                        DiasParaVencer: dias,
                        AlmacenNombre: p.Existencia.Almacen?.Nombre,
                        ProductoCodigo: p.Existencia.Producto?.Codigo
                    ));
                }
                else if ((!tipo.HasValue || tipo == TipoAlertaStock.ProximoVencer) &&
                         fVenc >= hoy &&
                         fVenc <= fechaLimite)
                {
                    alertas.Add(new AlertaStockResponse(
                        Tipo: TipoAlertaStock.ProximoVencer,
                        AlmacenId: p.Existencia.AlmacenId,
                        ProductoId: p.Existencia.ProductoId,
                        Producto: p.Existencia.Producto?.Nombre ?? "N/A",
                        Cantidad: p.Cantidad,
                        CantidadReservada: p.CantidadReservada,
                        CantidadDisponible: disponible,
                        StockMinimo: p.Existencia.Producto?.StockMinimo,
                        FechaVencimiento: fVenc,
                        DiasParaVencer: dias,
                        AlmacenNombre: p.Existencia.Almacen?.Nombre,
                        ProductoCodigo: p.Existencia.Producto?.Codigo
                    ));
                }
            }
        }

        return alertas.OrderBy(a => a.Tipo).ThenBy(a => a.DiasParaVencer ?? int.MaxValue).ToList();
    }
}
