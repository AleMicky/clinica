using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Lotes;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class LoteConsultaService(AlmacenDbContext context) : ILoteConsultaService
{
    public async Task<PagedResult<LoteResponse>> GetPagedAsync(
        LotePagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Lotes
            .AsNoTracking()
            .Include(x => x.Producto)
            .Include(x => x.Existencia)
            .AsQueryable();

        if (request.ProductoId.HasValue)
            query = query.Where(x => x.ProductoId == request.ProductoId.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.Numero.Contains(search) || x.Producto.Nombre.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.FechaIngreso)
            .Select(x => new LoteResponse(
                x.Id,
                x.ProductoId,
                x.Producto.Nombre,
                x.Numero,
                x.FechaVencimiento,
                x.FechaIngreso,
                x.ProveedorId,
                x.Existencia != null ? x.Existencia.Cantidad : 0m))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<LoteResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Lotes
            .AsNoTracking()
            .Include(x => x.Producto)
            .Include(x => x.Existencia)
            .Where(x => x.Id == id)
            .Select(x => new LoteResponse(
                x.Id,
                x.ProductoId,
                x.Producto.Nombre,
                x.Numero,
                x.FechaVencimiento,
                x.FechaIngreso,
                x.ProveedorId,
                x.Existencia != null ? x.Existencia.Cantidad : 0m))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
