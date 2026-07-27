using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Existencias;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class ExistenciaService(AlmacenDbContext context) : IExistenciaService
{
    public async Task<PagedResult<ExistenciaResponse>> GetPagedAsync(
        ExistenciaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = context.Existencias
            .AsNoTracking()
            .Include(x => x.Producto)
            .Include(x => x.Lote)
            .AsQueryable();

        if (request.ProductoId.HasValue)
            query = query.Where(x => x.ProductoId == request.ProductoId.Value);

        if (request.SoloNoVencidos == true)
        {
            query = query.Where(x =>
                x.Lote.FechaVencimiento == null || x.Lote.FechaVencimiento >= today);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Producto.Codigo.Contains(search)
                || x.Producto.Nombre.Contains(search)
                || x.Lote.Numero.Contains(search));
        }

        var projected = query
            .OrderBy(x => x.Producto.Nombre)
            .ThenBy(x => x.Lote.FechaVencimiento)
            .Select(x => new ExistenciaResponse(
                x.Id,
                x.ProductoId,
                x.Producto.Codigo,
                x.Producto.Nombre,
                x.LoteId,
                x.Lote.Numero,
                x.Lote.FechaVencimiento,
                x.Cantidad,
                x.Producto.StockMinimo,
                false));

        var page = await projected.ToPagedResultAsync(request, cancellationToken);

        // Bajo mínimo se calcula a nivel producto (suma de lotes).
        var productoIds = page.Items.Select(x => x.ProductoId).Distinct().ToList();
        var totales = await context.Existencias
            .AsNoTracking()
            .Where(x => productoIds.Contains(x.ProductoId))
            .GroupBy(x => x.ProductoId)
            .Select(g => new { ProductoId = g.Key, Total = g.Sum(x => x.Cantidad) })
            .ToDictionaryAsync(x => x.ProductoId, x => x.Total, cancellationToken);

        var items = page.Items
            .Select(x =>
            {
                var total = totales.GetValueOrDefault(x.ProductoId);
                var bajo = total < x.StockMinimo;
                return x with { BajoMinimo = bajo };
            })
            .Where(x => request.SoloBajoMinimo != true || x.BajoMinimo)
            .ToList();

        return new PagedResult<ExistenciaResponse>(
            items,
            request.SoloBajoMinimo == true ? items.Count : page.TotalRecords,
            page.Page,
            page.PageSize);
    }
}
