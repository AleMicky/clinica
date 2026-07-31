using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.Modules.Almacen.Infrastructure.Seed;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Modules.Almacen.Domain.Entities.Almacen;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class AlmacenStockService(
    AlmacenDbContext context,
    ICorrelativoService correlativoService) : IAlmacenStockService
{
    public const string CorrelativoCodigo = "ALM_MOVIMIENTO";

    public const string TipoIngreso = "INGRESO";
    public const string TipoSalida = "SALIDA";
    public const string TipoAjuste = "AJUSTE";
    public const string TipoBaja = "BAJA";
    public const string TipoTransferencia = "TRANSFERENCIA";

    public async Task<DisponibilidadProductoResponse> ConsultarDisponibilidadAsync(
        Guid productoId,
        CancellationToken cancellationToken = default)
    {
        var almacenId = AlmacenDbSeeder.AlmacenPrincipalId;
        var producto = await context.Productos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == productoId, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var lotes = await context.ProductosLote
            .AsNoTracking()
            .Where(x => x.ProductoId == productoId
                && x.AlmacenId == almacenId
                && x.CantidadDisponible > 0
                && !x.Bloqueado)
            .Where(x => x.FechaVencimiento == null || x.FechaVencimiento >= today)
            .OrderBy(x => x.FechaVencimiento ?? DateOnly.MaxValue)
            .Select(x => new DisponibilidadLoteResponse(
                x.Id,
                x.NumeroLote,
                x.FechaVencimiento,
                x.CantidadDisponible - x.CantidadReservada))
            .ToListAsync(cancellationToken);

        var stock = await context.ProductosStock
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ProductoId == productoId && x.AlmacenId == almacenId, cancellationToken);

        var disponible = lotes.Count > 0
            ? lotes.Sum(x => x.Cantidad)
            : stock?.CantidadUtilizable ?? 0;

        var stockMinimo = stock?.StockMinimo > 0 ? stock.StockMinimo : producto.StockMinimo;

        return new DisponibilidadProductoResponse(
            producto.Id,
            producto.Codigo,
            producto.Nombre,
            disponible,
            stockMinimo,
            disponible < stockMinimo,
            lotes);
    }

    public async Task<MovimientoResponse> RegistrarIngresoAsync(
        RegistrarIngresoRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var almacenId = ResolveAlmacenId(request.AlmacenId);
        var almacen = await GetAlmacenAsync(almacenId, cancellationToken);
        var tipo = await GetTipoMovimientoAsync(TipoIngreso, cancellationToken);
        var movimiento = await CreateMovimientoHeaderAsync(
            tipo,
            EstadoMovimientoAlmacen.Confirmado,
            request.Observaciones,
            request.ModuloOrigen,
            request.EntidadOrigen,
            request.ReferenciaId,
            almacenOrigenId: null,
            almacenDestinoId: almacenId,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            var producto = await GetProductoAsync(linea.ProductoId, cancellationToken);
            var lote = await ResolveOrCreateLoteAsync(producto, almacenId, linea, cancellationToken);
            await ApplyStockDeltaAsync(producto.Id, almacen, lote, linea.Cantidad, cancellationToken);

            var costo = linea.CostoUnitario ?? lote.CostoUnitario;
            movimiento.Detalles.Add(new MovimientoAlmacenDetalle
            {
                Id = Guid.NewGuid(),
                MovimientoAlmacenId = movimiento.Id,
                ProductoId = producto.Id,
                ProductoLoteId = lote.Id,
                Cantidad = linea.Cantidad,
                CostoUnitario = costo,
                CostoTotal = costo * linea.Cantidad,
                CreatedAt = DateTime.UtcNow,
            });
        }

        context.MovimientosAlmacen.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    public async Task<MovimientoResponse> RegistrarSalidaAsync(
        RegistrarSalidaRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var almacenId = ResolveAlmacenId(request.AlmacenId);
        var almacen = await GetAlmacenAsync(almacenId, cancellationToken);
        var tipo = await GetTipoMovimientoAsync(TipoSalida, cancellationToken);
        var movimiento = await CreateMovimientoHeaderAsync(
            tipo,
            EstadoMovimientoAlmacen.Confirmado,
            request.Observaciones,
            request.ModuloOrigen,
            request.EntidadOrigen,
            request.ReferenciaId,
            almacenOrigenId: almacenId,
            almacenDestinoId: null,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            var producto = await GetProductoAsync(linea.ProductoId, cancellationToken);

            if (request.UsarFefo || linea.LoteId is null)
            {
                var allocations = await AllocateFefoAsync(producto.Id, almacenId, linea.Cantidad, cancellationToken);
                foreach (var alloc in allocations)
                {
                    var lote = await context.ProductosLote
                        .FirstAsync(x => x.Id == alloc.LoteId, cancellationToken);
                    await ApplyStockDeltaAsync(producto.Id, almacen, lote, -alloc.Cantidad, cancellationToken);
                    movimiento.Detalles.Add(CreateDetalle(movimiento.Id, producto.Id, lote.Id, alloc.Cantidad, lote.CostoUnitario));
                }
            }
            else
            {
                var lote = await GetLoteAsync(linea.LoteId.Value, producto.Id, almacenId, cancellationToken);
                await ApplyStockDeltaAsync(producto.Id, almacen, lote, -linea.Cantidad, cancellationToken);
                movimiento.Detalles.Add(CreateDetalle(movimiento.Id, producto.Id, lote.Id, linea.Cantidad, lote.CostoUnitario));
            }
        }

        context.MovimientosAlmacen.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    public async Task<DescontarFefoResponse> DescontarFefoAsync(
        DescontarFefoRequest request,
        CancellationToken cancellationToken = default)
    {
        var movimiento = await RegistrarSalidaAsync(
            new RegistrarSalidaRequest(
                [new MovimientoDetalleLineaRequest(request.ProductoId, null, request.Cantidad)],
                request.Observaciones,
                request.ModuloOrigen,
                request.EntidadOrigen,
                request.ReferenciaId,
                UsarFefo: true,
                request.AlmacenId),
            cancellationToken);

        return new DescontarFefoResponse(
            movimiento.Id,
            movimiento.Numero,
            movimiento.Detalles
                .Select(d => new DescontarFefoLineaResponse(
                    d.LoteId ?? Guid.Empty,
                    d.LoteNumero ?? string.Empty,
                    null,
                    d.Cantidad))
                .ToList());
    }

    public async Task<MovimientoResponse> RegistrarAjusteAsync(
        RegistrarAjusteRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var almacenId = ResolveAlmacenId(request.AlmacenId);
        var almacen = await GetAlmacenAsync(almacenId, cancellationToken);
        var tipo = await GetTipoMovimientoAsync(TipoAjuste, cancellationToken);
        var movimiento = await CreateMovimientoHeaderAsync(
            tipo,
            EstadoMovimientoAlmacen.Confirmado,
            request.Observaciones,
            null,
            null,
            null,
            almacenOrigenId: almacenId,
            almacenDestinoId: almacenId,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            var producto = await GetProductoAsync(linea.ProductoId, cancellationToken);
            var lote = await ResolveOrCreateLoteAsync(producto, almacenId, linea, cancellationToken);
            await ApplyStockDeltaAsync(producto.Id, almacen, lote, linea.Cantidad, cancellationToken);
            var costo = linea.CostoUnitario ?? lote.CostoUnitario;
            movimiento.Detalles.Add(CreateDetalle(movimiento.Id, producto.Id, lote.Id, linea.Cantidad, costo));
        }

        context.MovimientosAlmacen.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    public async Task<MovimientoResponse> RegistrarBajaAsync(
        RegistrarBajaRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var almacenId = ResolveAlmacenId(request.AlmacenId);
        var almacen = await GetAlmacenAsync(almacenId, cancellationToken);
        var tipo = await GetTipoMovimientoAsync(TipoBaja, cancellationToken);
        var movimiento = await CreateMovimientoHeaderAsync(
            tipo,
            EstadoMovimientoAlmacen.Confirmado,
            request.Observaciones,
            null,
            null,
            null,
            almacenOrigenId: almacenId,
            almacenDestinoId: null,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            var producto = await GetProductoAsync(linea.ProductoId, cancellationToken);
            ProductoLote lote;
            if (linea.LoteId.HasValue)
            {
                lote = await GetLoteAsync(linea.LoteId.Value, producto.Id, almacenId, cancellationToken);
            }
            else
            {
                var allocations = await AllocateFefoAsync(producto.Id, almacenId, linea.Cantidad, cancellationToken);
                foreach (var alloc in allocations)
                {
                    lote = await context.ProductosLote.FirstAsync(x => x.Id == alloc.LoteId, cancellationToken);
                    await ApplyStockDeltaAsync(producto.Id, almacen, lote, -alloc.Cantidad, cancellationToken);
                    movimiento.Detalles.Add(CreateDetalle(movimiento.Id, producto.Id, lote.Id, alloc.Cantidad, lote.CostoUnitario));
                }

                continue;
            }

            await ApplyStockDeltaAsync(producto.Id, almacen, lote, -Math.Abs(linea.Cantidad), cancellationToken);
            movimiento.Detalles.Add(CreateDetalle(movimiento.Id, producto.Id, lote.Id, Math.Abs(linea.Cantidad), lote.CostoUnitario));
        }

        context.MovimientosAlmacen.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    public async Task<MovimientoResponse> RegistrarTransferenciaAsync(
        RegistrarTransferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.AlmacenDestinoId is null || request.AlmacenDestinoId == Guid.Empty)
            throw new BusinessException("Debe indicar el almacén destino.");

        var origenId = ResolveAlmacenId(request.AlmacenOrigenId);
        var destinoId = request.AlmacenDestinoId.Value;
        if (origenId == destinoId)
            throw new BusinessException("El almacén origen y destino deben ser distintos.");

        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var origen = await GetAlmacenAsync(origenId, cancellationToken);
        var destino = await GetAlmacenAsync(destinoId, cancellationToken);
        var tipo = await GetTipoMovimientoAsync(TipoTransferencia, cancellationToken);
        var movimiento = await CreateMovimientoHeaderAsync(
            tipo,
            EstadoMovimientoAlmacen.Confirmado,
            request.Observaciones,
            null,
            null,
            null,
            origenId,
            destinoId,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            var producto = await GetProductoAsync(linea.ProductoId, cancellationToken);
            List<(Guid LoteId, decimal Cantidad)> allocations;

            if (linea.LoteId.HasValue)
            {
                allocations = [(linea.LoteId.Value, linea.Cantidad)];
            }
            else
            {
                allocations = await AllocateFefoAsync(producto.Id, origenId, linea.Cantidad, cancellationToken);
            }

            foreach (var alloc in allocations)
            {
                var loteOrigen = await GetLoteAsync(alloc.LoteId, producto.Id, origenId, cancellationToken);
                await ApplyStockDeltaAsync(producto.Id, origen, loteOrigen, -alloc.Cantidad, cancellationToken);

                var loteDestino = await ResolveOrCreateLoteAsync(
                    producto,
                    destinoId,
                    new MovimientoDetalleLineaRequest(
                        producto.Id,
                        null,
                        alloc.Cantidad,
                        loteOrigen.CostoUnitario,
                        loteOrigen.NumeroLote,
                        loteOrigen.FechaVencimiento),
                    cancellationToken);
                if (loteDestino.FechaFabricacion is null)
                    loteDestino.FechaFabricacion = loteOrigen.FechaFabricacion;
                if (loteDestino.CostoUnitario == 0)
                    loteDestino.CostoUnitario = loteOrigen.CostoUnitario;

                await ApplyStockDeltaAsync(producto.Id, destino, loteDestino, alloc.Cantidad, cancellationToken);

                movimiento.Detalles.Add(CreateDetalle(
                    movimiento.Id,
                    producto.Id,
                    loteOrigen.Id,
                    alloc.Cantidad,
                    loteOrigen.CostoUnitario));
            }
        }

        context.MovimientosAlmacen.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    public async Task<MovimientoResponse> AplicarMovimientoAsync(
        Guid movimientoId,
        AplicarMovimientoRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var movimiento = await context.MovimientosAlmacen
            .Include(x => x.TipoMovimientoAlmacen)
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == movimientoId, cancellationToken)
            ?? throw new NotFoundException("Movimiento no encontrado.");

        if (movimiento.Estado == EstadoMovimientoAlmacen.Confirmado)
            return (await GetMovimientoByIdAsync(movimientoId, cancellationToken))!;

        if (movimiento.Estado != EstadoMovimientoAlmacen.Borrador)
            throw new BusinessException($"El movimiento no puede aplicarse en estado {movimiento.Estado}.");

        await ApplyMovimientoStockAsync(movimiento, reverse: false, cancellationToken);

        movimiento.Estado = EstadoMovimientoAlmacen.Confirmado;
        movimiento.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimientoId, cancellationToken))!;
    }

    public async Task<MovimientoResponse?> GetMovimientoByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var movimiento = await context.MovimientosAlmacen
            .AsNoTracking()
            .Include(x => x.TipoMovimientoAlmacen)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.ProductoLote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return movimiento is null ? null : MapMovimiento(movimiento);
    }

    public async Task<PagedResult<MovimientoListItemResponse>> GetMovimientosPagedAsync(
        MovimientoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.MovimientosAlmacen
            .AsNoTracking()
            .Include(x => x.TipoMovimientoAlmacen)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Tipo))
        {
            var tipo = request.Tipo.Trim().ToUpperInvariant();
            query = query.Where(x => x.TipoMovimientoAlmacen.Codigo == tipo);
        }

        if (!string.IsNullOrWhiteSpace(request.Estado)
            && Enum.TryParse<EstadoMovimientoAlmacen>(request.Estado.Trim(), true, out var estado))
        {
            query = query.Where(x => x.Estado == estado);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.Fecha)
            .Select(x => new MovimientoListItemResponse(
                x.Id,
                x.Numero,
                x.TipoMovimientoAlmacen.Codigo,
                x.Fecha,
                x.Estado.ToString(),
                false,
                null))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task SetMovimientoEstadoAsync(
        Guid movimientoId,
        string estado,
        CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<EstadoMovimientoAlmacen>(estado.Trim(), true, out var nuevoEstado))
            throw new BusinessException($"Estado de movimiento inválido: {estado}");

        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var movimiento = await context.MovimientosAlmacen
            .Include(x => x.TipoMovimientoAlmacen)
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == movimientoId, cancellationToken)
            ?? throw new NotFoundException("Movimiento no encontrado.");

        if (movimiento.Estado == nuevoEstado)
        {
            await tx.CommitAsync(cancellationToken);
            return;
        }

        if (nuevoEstado == EstadoMovimientoAlmacen.Confirmado
            && movimiento.Estado == EstadoMovimientoAlmacen.Borrador)
        {
            await ApplyMovimientoStockAsync(movimiento, reverse: false, cancellationToken);
            movimiento.Estado = EstadoMovimientoAlmacen.Confirmado;
        }
        else if (nuevoEstado == EstadoMovimientoAlmacen.Anulado
            && movimiento.Estado == EstadoMovimientoAlmacen.Confirmado)
        {
            await ApplyMovimientoStockAsync(movimiento, reverse: true, cancellationToken);
            movimiento.Estado = EstadoMovimientoAlmacen.Anulado;
        }
        else if (nuevoEstado == EstadoMovimientoAlmacen.Anulado
            && movimiento.Estado == EstadoMovimientoAlmacen.Borrador)
        {
            movimiento.Estado = EstadoMovimientoAlmacen.Anulado;
        }
        else
        {
            throw new BusinessException(
                $"No se puede cambiar el movimiento de {movimiento.Estado} a {nuevoEstado}.");
        }

        movimiento.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
    }

    private async Task ApplyMovimientoStockAsync(
        MovimientoAlmacen movimiento,
        bool reverse,
        CancellationToken cancellationToken)
    {
        var codigo = movimiento.TipoMovimientoAlmacen.Codigo;
        var factor = reverse ? -1m : 1m;

        if (codigo == TipoTransferencia)
        {
            if (movimiento.AlmacenOrigenId is null || movimiento.AlmacenDestinoId is null)
                throw new BusinessException("La transferencia requiere almacén origen y destino.");

            var origen = await GetAlmacenAsync(movimiento.AlmacenOrigenId.Value, cancellationToken);
            var destino = await GetAlmacenAsync(movimiento.AlmacenDestinoId.Value, cancellationToken);

            foreach (var detalle in movimiento.Detalles)
            {
                if (detalle.ProductoLoteId is null)
                    throw new BusinessException("El detalle del movimiento no tiene lote asignado.");

                var loteOrigen = await context.ProductosLote
                    .FirstAsync(x => x.Id == detalle.ProductoLoteId.Value, cancellationToken);
                var producto = await GetProductoAsync(detalle.ProductoId, cancellationToken);
                var cantidad = detalle.Cantidad * factor;

                await ApplyStockDeltaAsync(detalle.ProductoId, origen, loteOrigen, -cantidad, cancellationToken);

                var loteDestino = await ResolveOrCreateLoteAsync(
                    producto,
                    destino.Id,
                    new MovimientoDetalleLineaRequest(
                        detalle.ProductoId,
                        null,
                        detalle.Cantidad,
                        detalle.CostoUnitario,
                        loteOrigen.NumeroLote,
                        loteOrigen.FechaVencimiento),
                    cancellationToken);
                await ApplyStockDeltaAsync(detalle.ProductoId, destino, loteDestino, cantidad, cancellationToken);
            }

            return;
        }

        foreach (var detalle in movimiento.Detalles)
        {
            if (detalle.ProductoLoteId is null)
                throw new BusinessException("El detalle del movimiento no tiene lote asignado.");

            var almacenId = codigo switch
            {
                TipoIngreso => movimiento.AlmacenDestinoId ?? ResolveAlmacenId(null),
                TipoSalida or TipoBaja => movimiento.AlmacenOrigenId ?? ResolveAlmacenId(null),
                TipoAjuste => movimiento.AlmacenOrigenId
                    ?? movimiento.AlmacenDestinoId
                    ?? ResolveAlmacenId(null),
                _ => movimiento.AlmacenOrigenId ?? movimiento.AlmacenDestinoId ?? ResolveAlmacenId(null),
            };

            var almacen = await GetAlmacenAsync(almacenId, cancellationToken);
            var lote = await context.ProductosLote
                .FirstAsync(x => x.Id == detalle.ProductoLoteId.Value, cancellationToken);

            var delta = codigo switch
            {
                TipoIngreso => detalle.Cantidad,
                TipoSalida or TipoBaja => -Math.Abs(detalle.Cantidad),
                TipoAjuste => detalle.Cantidad,
                _ => detalle.Cantidad,
            };

            await ApplyStockDeltaAsync(detalle.ProductoId, almacen, lote, delta * factor, cancellationToken);
        }
    }

    private async Task<MovimientoAlmacen> CreateMovimientoHeaderAsync(
        TipoMovimientoAlmacen tipo,
        EstadoMovimientoAlmacen estado,
        string? observaciones,
        string? moduloOrigen,
        string? entidadOrigen,
        Guid? referenciaId,
        Guid? almacenOrigenId,
        Guid? almacenDestinoId,
        CancellationToken cancellationToken)
    {
        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "ALM-", Longitud: 6),
            cancellationToken);

        return new MovimientoAlmacen
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            Fecha = DateTime.UtcNow,
            TipoMovimientoAlmacenId = tipo.Id,
            TipoMovimientoAlmacen = tipo,
            AlmacenOrigenId = almacenOrigenId,
            AlmacenDestinoId = almacenDestinoId,
            ModuloOrigen = moduloOrigen,
            EntidadOrigen = entidadOrigen,
            ReferenciaId = referenciaId,
            Estado = estado,
            Observacion = observaciones,
            CreatedAt = DateTime.UtcNow,
        };
    }

    private static MovimientoAlmacenDetalle CreateDetalle(
        Guid movimientoId,
        Guid productoId,
        Guid loteId,
        decimal cantidad,
        decimal costoUnitario) =>
        new()
        {
            Id = Guid.NewGuid(),
            MovimientoAlmacenId = movimientoId,
            ProductoId = productoId,
            ProductoLoteId = loteId,
            Cantidad = cantidad,
            CostoUnitario = costoUnitario,
            CostoTotal = costoUnitario * Math.Abs(cantidad),
            CreatedAt = DateTime.UtcNow,
        };

    private static Guid ResolveAlmacenId(Guid? almacenId) =>
        almacenId is null || almacenId == Guid.Empty
            ? AlmacenDbSeeder.AlmacenPrincipalId
            : almacenId.Value;

    private async Task<AlmacenEntity> GetAlmacenAsync(Guid almacenId, CancellationToken cancellationToken) =>
        await context.Almacenes.FirstOrDefaultAsync(x => x.Id == almacenId, cancellationToken)
            ?? throw new NotFoundException("Almacén no encontrado.");

    private async Task<TipoMovimientoAlmacen> GetTipoMovimientoAsync(
        string codigo,
        CancellationToken cancellationToken) =>
        await context.TiposMovimientoAlmacen
            .FirstOrDefaultAsync(x => x.Codigo == codigo, cancellationToken)
            ?? throw new BusinessException($"Tipo de movimiento '{codigo}' no configurado.");

    private async Task<Producto> GetProductoAsync(Guid productoId, CancellationToken cancellationToken) =>
        await context.Productos
            .FirstOrDefaultAsync(x => x.Id == productoId && x.Activo, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado o inactivo.");

    private async Task<ProductoLote> GetLoteAsync(
        Guid loteId,
        Guid productoId,
        Guid almacenId,
        CancellationToken cancellationToken) =>
        await context.ProductosLote
            .FirstOrDefaultAsync(
                x => x.Id == loteId && x.ProductoId == productoId && x.AlmacenId == almacenId,
                cancellationToken)
            ?? throw new NotFoundException("Lote no encontrado.");

    private async Task<ProductoLote> ResolveOrCreateLoteAsync(
        Producto producto,
        Guid almacenId,
        MovimientoDetalleLineaRequest linea,
        CancellationToken cancellationToken)
    {
        if (linea.LoteId.HasValue)
            return await GetLoteAsync(linea.LoteId.Value, producto.Id, almacenId, cancellationToken);

        var numero = string.IsNullOrWhiteSpace(linea.NumeroLote)
            ? (producto.ManejaLote ? $"AUTO-{DateTime.UtcNow:yyyyMMddHHmmss}" : "SIN-LOTE")
            : linea.NumeroLote.Trim();

        var existing = await context.ProductosLote
            .FirstOrDefaultAsync(
                x => x.ProductoId == producto.Id && x.AlmacenId == almacenId && x.NumeroLote == numero,
                cancellationToken);

        if (existing is not null)
        {
            if (linea.CostoUnitario is decimal costo && costo > 0)
                existing.CostoUnitario = costo;
            if (linea.FechaVencimiento.HasValue)
                existing.FechaVencimiento = linea.FechaVencimiento;
            return existing;
        }

        var lote = new ProductoLote
        {
            Id = Guid.NewGuid(),
            ProductoId = producto.Id,
            AlmacenId = almacenId,
            NumeroLote = numero,
            FechaVencimiento = linea.FechaVencimiento,
            CostoUnitario = linea.CostoUnitario ?? 0,
            CantidadInicial = 0,
            CantidadDisponible = 0,
            CreatedAt = DateTime.UtcNow,
        };
        context.ProductosLote.Add(lote);
        return lote;
    }

    private async Task ApplyStockDeltaAsync(
        Guid productoId,
        AlmacenEntity almacen,
        ProductoLote lote,
        decimal delta,
        CancellationToken cancellationToken)
    {
        lote.AplicarDelta(delta, almacen.PermiteStockNegativo);

        var stock = await context.ProductosStock
            .FirstOrDefaultAsync(x => x.ProductoId == productoId && x.AlmacenId == almacen.Id, cancellationToken);

        if (stock is null)
        {
            if (delta < 0 && !almacen.PermiteStockNegativo)
                throw new BusinessException("No hay existencia suficiente para el producto indicado.");

            var producto = await context.Productos.FirstAsync(x => x.Id == productoId, cancellationToken);
            stock = new ProductoStock
            {
                Id = Guid.NewGuid(),
                ProductoId = productoId,
                AlmacenId = almacen.Id,
                CantidadDisponible = 0,
                StockMinimo = producto.StockMinimo,
                StockMaximo = producto.StockMaximo,
                CreatedAt = DateTime.UtcNow,
            };
            context.ProductosStock.Add(stock);
        }

        stock.AplicarDelta(delta, almacen.PermiteStockNegativo);
    }

    private async Task<List<(Guid LoteId, decimal Cantidad)>> AllocateFefoAsync(
        Guid productoId,
        Guid almacenId,
        decimal cantidad,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var lotes = await context.ProductosLote
            .Where(x => x.ProductoId == productoId
                && x.AlmacenId == almacenId
                && x.CantidadDisponible > x.CantidadReservada
                && !x.Bloqueado)
            .Where(x => x.FechaVencimiento == null || x.FechaVencimiento >= today)
            .OrderBy(x => x.FechaVencimiento ?? DateOnly.MaxValue)
            .ThenBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        var restante = cantidad;
        var result = new List<(Guid, decimal)>();

        foreach (var lote in lotes)
        {
            if (restante <= 0)
                break;

            var tomar = Math.Min(lote.CantidadUtilizable, restante);
            result.Add((lote.Id, tomar));
            restante -= tomar;
        }

        if (restante > 0)
            throw new BusinessException(
                "Stock insuficiente o solo hay lotes vencidos/bloqueados para el producto solicitado.");

        return result;
    }

    private static MovimientoResponse MapMovimiento(MovimientoAlmacen movimiento) =>
        new(
            movimiento.Id,
            movimiento.Numero,
            movimiento.TipoMovimientoAlmacen?.Codigo ?? string.Empty,
            movimiento.Fecha,
            movimiento.Estado.ToString(),
            movimiento.Observacion,
            movimiento.ModuloOrigen,
            movimiento.EntidadOrigen,
            movimiento.ReferenciaId,
            ProveedorId: null,
            WorkflowInstanceId: null,
            RequiereAprobacion: false,
            movimiento.Detalles.Select(d => new MovimientoDetalleResponse(
                d.Id,
                d.ProductoId,
                d.Producto?.Codigo ?? string.Empty,
                d.Producto?.Nombre ?? string.Empty,
                d.ProductoLoteId,
                d.ProductoLote?.NumeroLote,
                d.Cantidad,
                d.CostoUnitario)).ToList(),
            movimiento.AlmacenOrigenId,
            movimiento.AlmacenDestinoId);
}
