using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.Modules.Compras.Application.Abstractions;
using Clinica.Modules.Compras.Application.OrdenesCompra;
using Clinica.Modules.Compras.Domain.Entities;
using Clinica.Modules.Compras.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Compras.Infrastructure.Services;

public sealed class OrdenCompraService(
    ComprasDbContext context,
    ICorrelativoService correlativoService,
    IAlmacenStockService almacenStockService) : IOrdenCompraService
{
    public const string CorrelativoCodigo = "COM_ORDEN";

    public async Task<PagedResult<OrdenCompraListItemResponse>> GetPagedAsync(
        OrdenCompraPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.OrdenesCompra
            .AsNoTracking()
            .Include(x => x.Proveedor)
            .AsQueryable();

        if (request.ProveedorId.HasValue)
            query = query.Where(x => x.ProveedorId == request.ProveedorId.Value);
        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search) || x.Proveedor.Nombre.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.Fecha)
            .Select(x => new OrdenCompraListItemResponse(
                x.Id,
                x.Numero,
                x.ProveedorId,
                x.Proveedor.Nombre,
                x.Fecha,
                x.Estado))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<OrdenCompraResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.OrdenesCompra
            .AsNoTracking()
            .Include(x => x.Proveedor)
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity is null ? null : Map(entity);
    }

    public async Task<OrdenCompraResponse> CreateAsync(
        CreateOrdenCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var proveedor = await context.Proveedores
            .FirstOrDefaultAsync(x => x.Id == request.ProveedorId && x.Activo, cancellationToken)
            ?? throw new NotFoundException("Proveedor no encontrado.");

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "OC-", Longitud: 6),
            cancellationToken);

        var entity = new OrdenCompra
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            ProveedorId = proveedor.Id,
            Fecha = DateTime.UtcNow,
            Estado = OrdenCompraEstados.Borrador,
            Observaciones = request.Observaciones,
            CreatedAt = DateTime.UtcNow,
            Detalles = request.Detalles.Select(d => new OrdenCompraDetalle
            {
                Id = Guid.NewGuid(),
                ProductoId = d.ProductoId,
                Cantidad = d.Cantidad,
                CostoUnitario = d.CostoUnitario,
                CantidadRecibida = 0,
                CreatedAt = DateTime.UtcNow,
            }).ToList(),
        };

        context.OrdenesCompra.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<OrdenCompraResponse> ConfirmarAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.OrdenesCompra
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Orden de compra no encontrada.");

        if (entity.Estado != OrdenCompraEstados.Borrador)
            throw new BusinessException("Solo se pueden confirmar órdenes en borrador.");

        entity.Estado = OrdenCompraEstados.Confirmada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(id, cancellationToken))!;
    }

    public async Task<OrdenCompraResponse> RecibirAsync(
        Guid id,
        RecibirOrdenRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.OrdenesCompra
            .Include(x => x.Detalles)
            .Include(x => x.Proveedor)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Orden de compra no encontrada.");

        if (entity.Estado is OrdenCompraEstados.Borrador or OrdenCompraEstados.Anulada or OrdenCompraEstados.Recibida)
            throw new BusinessException("La orden no puede recibirse en su estado actual.");

        var ingresoLineas = new List<MovimientoDetalleLineaRequest>();

        foreach (var linea in request.Lineas)
        {
            var detalle = entity.Detalles.FirstOrDefault(x => x.Id == linea.DetalleId)
                ?? throw new NotFoundException("Detalle de orden no encontrado.");

            var pendiente = detalle.Cantidad - detalle.CantidadRecibida;
            if (linea.Cantidad > pendiente)
                throw new BusinessException(
                    $"La cantidad a recibir supera lo pendiente del producto ({pendiente}).");

            detalle.CantidadRecibida += linea.Cantidad;
            detalle.UpdatedAt = DateTime.UtcNow;

            ingresoLineas.Add(new MovimientoDetalleLineaRequest(
                detalle.ProductoId,
                null,
                linea.Cantidad,
                detalle.CostoUnitario,
                linea.NumeroLote,
                linea.FechaVencimiento));
        }

        await almacenStockService.RegistrarIngresoAsync(
            new RegistrarIngresoRequest(
                ingresoLineas,
                entity.ProveedorId,
                $"Recepción OC {entity.Numero}",
                "Compras",
                "OrdenCompra",
                entity.Id),
            cancellationToken);

        var completa = entity.Detalles.All(x => x.CantidadRecibida >= x.Cantidad);
        entity.Estado = completa ? OrdenCompraEstados.Recibida : OrdenCompraEstados.Parcial;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(id, cancellationToken))!;
    }

    public async Task AnularAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.OrdenesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Orden de compra no encontrada.");

        if (entity.Detalles.Any(x => x.CantidadRecibida > 0))
            throw new BusinessException("No se puede anular una orden con recepciones parciales.");

        entity.Estado = OrdenCompraEstados.Anulada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }

    private static OrdenCompraResponse Map(OrdenCompra entity) =>
        new(
            entity.Id,
            entity.Numero,
            entity.ProveedorId,
            entity.Proveedor?.Nombre ?? string.Empty,
            entity.Fecha,
            entity.Estado,
            entity.Observaciones,
            entity.Detalles.Select(d => new OrdenCompraDetalleResponse(
                d.Id,
                d.ProductoId,
                d.Cantidad,
                d.CostoUnitario,
                d.CantidadRecibida)).ToList());
}
