using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Inventarios;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class InventarioFisicoService(
    AlmacenDbContext context,
    ICorrelativoService correlativoService,
    IAlmacenStockService stockService) : IInventarioFisicoService
{
    public const string CorrelativoCodigo = "ALM_INVENTARIO";

    public async Task<PagedResult<InventarioListItemResponse>> GetPagedAsync(
        InventarioPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.InventariosFisicos
            .AsNoTracking()
            .Include(x => x.Almacen)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Estado)
            && Enum.TryParse<EstadoInventarioFisico>(request.Estado, true, out var estado))
            query = query.Where(x => x.Estado == estado);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.FechaInicio)
            .Select(x => new InventarioListItemResponse(
                x.Id,
                x.Numero,
                x.Almacen.Nombre,
                x.FechaInicio,
                x.Estado.ToString()))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<InventarioFisicoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadAsync(id, false, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<InventarioFisicoResponse> CreateAsync(
        CreateInventarioFisicoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await context.Almacenes.AnyAsync(x => x.Id == request.AlmacenId, cancellationToken))
            throw new NotFoundException("Almacén no encontrado.");

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "INV-", Longitud: 6),
            cancellationToken);

        var entity = new InventarioFisico
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            AlmacenId = request.AlmacenId,
            FechaInicio = DateTime.UtcNow,
            Estado = EstadoInventarioFisico.Borrador,
            Observacion = request.Observacion,
            CreatedAt = DateTime.UtcNow,
        };

        context.InventariosFisicos.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<InventarioFisicoResponse> IniciarConteoAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoInventarioFisico.Borrador);

        var lotes = await context.ProductosLote
            .AsNoTracking()
            .Include(x => x.Producto)
            .Where(x => x.AlmacenId == entity.AlmacenId && x.CantidadDisponible != 0)
            .ToListAsync(cancellationToken);

        foreach (var lote in lotes)
        {
            entity.Detalles.Add(new InventarioFisicoDetalle
            {
                Id = Guid.NewGuid(),
                InventarioFisicoId = entity.Id,
                ProductoId = lote.ProductoId,
                ProductoLoteId = lote.Id,
                CantidadSistema = lote.CantidadDisponible,
                CantidadContada = lote.CantidadDisponible,
                CreatedAt = DateTime.UtcNow,
            });
        }

        var sinLote = await context.ProductosStock
            .AsNoTracking()
            .Where(x => x.AlmacenId == entity.AlmacenId && x.CantidadDisponible != 0)
            .Where(x => !context.ProductosLote.Any(l =>
                l.ProductoId == x.ProductoId && l.AlmacenId == x.AlmacenId && l.CantidadDisponible != 0))
            .ToListAsync(cancellationToken);

        foreach (var stock in sinLote)
        {
            entity.Detalles.Add(new InventarioFisicoDetalle
            {
                Id = Guid.NewGuid(),
                InventarioFisicoId = entity.Id,
                ProductoId = stock.ProductoId,
                CantidadSistema = stock.CantidadDisponible,
                CantidadContada = stock.CantidadDisponible,
                CreatedAt = DateTime.UtcNow,
            });
        }

        entity.Estado = EstadoInventarioFisico.EnConteo;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<InventarioFisicoResponse> ContarAsync(
        Guid id,
        ContarInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoInventarioFisico.EnConteo);

        foreach (var item in request.Detalles)
        {
            var detalle = entity.Detalles.FirstOrDefault(x =>
                x.ProductoId == item.ProductoId
                && x.ProductoLoteId == item.ProductoLoteId);

            if (detalle is null)
            {
                var sistema = 0m;
                if (item.ProductoLoteId is Guid loteId)
                {
                    sistema = await context.ProductosLote
                        .Where(x => x.Id == loteId)
                        .Select(x => x.CantidadDisponible)
                        .FirstOrDefaultAsync(cancellationToken);
                }
                else
                {
                    sistema = await context.ProductosStock
                        .Where(x => x.ProductoId == item.ProductoId && x.AlmacenId == entity.AlmacenId)
                        .Select(x => x.CantidadDisponible)
                        .FirstOrDefaultAsync(cancellationToken);
                }

                detalle = new InventarioFisicoDetalle
                {
                    Id = Guid.NewGuid(),
                    InventarioFisicoId = entity.Id,
                    ProductoId = item.ProductoId,
                    ProductoLoteId = item.ProductoLoteId,
                    CantidadSistema = sistema,
                    CreatedAt = DateTime.UtcNow,
                };
                entity.Detalles.Add(detalle);
            }

            detalle.CantidadContada = item.CantidadContada;
            detalle.Observacion = item.Observacion;
            detalle.UpdatedAt = DateTime.UtcNow;
        }

        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<InventarioFisicoResponse> FinalizarConteoAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoInventarioFisico.EnConteo);
        entity.Estado = EstadoInventarioFisico.ConteoFinalizado;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<InventarioFisicoResponse> AprobarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoInventarioFisico.ConteoFinalizado);

        var ajustes = entity.Detalles
            .Where(d => d.Diferencia != 0)
            .Select(d => new MovimientoDetalleLineaRequest(
                d.ProductoId,
                d.ProductoLoteId,
                d.Diferencia))
            .ToList();

        if (ajustes.Count > 0)
        {
            await stockService.RegistrarAjusteAsync(
                new RegistrarAjusteRequest(
                    ajustes,
                    $"Ajuste por inventario físico {entity.Numero}",
                    null,
                    entity.AlmacenId),
                cancellationToken);
        }

        entity.Estado = EstadoInventarioFisico.Aprobado;
        entity.FechaFinalizacion = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<InventarioFisicoResponse> AnularAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        if (entity.Estado == EstadoInventarioFisico.Aprobado)
            throw new BusinessException("No se puede anular un inventario ya aprobado.");

        entity.Estado = EstadoInventarioFisico.Anulado;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    private async Task<InventarioFisico?> LoadAsync(Guid id, bool asTracking, CancellationToken cancellationToken)
    {
        IQueryable<InventarioFisico> query = context.InventariosFisicos
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.ProductoLote);

        if (!asTracking)
            query = query.AsNoTracking();

        return await query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<InventarioFisico> LoadRequiredAsync(Guid id, CancellationToken cancellationToken) =>
        await LoadAsync(id, true, cancellationToken)
            ?? throw new NotFoundException("Inventario físico no encontrado.");

    private static void EnsureEstado(InventarioFisico entity, EstadoInventarioFisico expected)
    {
        if (entity.Estado != expected)
            throw new BusinessException($"El inventario debe estar en estado {expected}.");
    }

    private static InventarioFisicoResponse Map(InventarioFisico e) =>
        new(
            e.Id,
            e.Numero,
            e.AlmacenId,
            e.Almacen?.Nombre ?? string.Empty,
            e.FechaInicio,
            e.FechaFinalizacion,
            e.Estado.ToString(),
            e.Observacion,
            e.Detalles.Select(d => new InventarioDetalleResponse(
                d.Id,
                d.ProductoId,
                d.Producto?.Codigo ?? string.Empty,
                d.Producto?.Nombre ?? string.Empty,
                d.ProductoLoteId,
                d.ProductoLote?.NumeroLote,
                d.CantidadSistema,
                d.CantidadContada,
                d.Diferencia,
                d.Observacion)).ToList());
}
