using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Existencias;
using Clinica.Modules.Almacen.Application.Movimientos;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class AlmacenStockService(
    AlmacenDbContext context,
    ICorrelativoService correlativoService,
    IWorkflowInstanceService workflowInstanceService) : IAlmacenStockService
{
    public const string CorrelativoCodigo = "ALM_MOVIMIENTO";
    public const string WorkflowDefinitionCode = "ALMACEN_MOVIMIENTO";

    public async Task<DisponibilidadProductoResponse> ConsultarDisponibilidadAsync(
        Guid productoId,
        CancellationToken cancellationToken = default)
    {
        var producto = await context.Productos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == productoId, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var lotes = await context.Existencias
            .AsNoTracking()
            .Include(x => x.Lote)
            .Where(x => x.ProductoId == productoId && x.Cantidad > 0)
            .Where(x => x.Lote.FechaVencimiento == null || x.Lote.FechaVencimiento >= today)
            .OrderBy(x => x.Lote.FechaVencimiento ?? DateOnly.MaxValue)
            .Select(x => new DisponibilidadLoteResponse(
                x.LoteId,
                x.Lote.Numero,
                x.Lote.FechaVencimiento,
                x.Cantidad))
            .ToListAsync(cancellationToken);

        var disponible = lotes.Sum(x => x.Cantidad);
        return new DisponibilidadProductoResponse(
            producto.Id,
            producto.Codigo,
            producto.Nombre,
            disponible,
            producto.StockMinimo,
            disponible < producto.StockMinimo,
            lotes);
    }

    public async Task<MovimientoResponse> RegistrarIngresoAsync(
        RegistrarIngresoRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var movimiento = await CreateMovimientoHeaderAsync(
            MovimientoTipos.Ingreso,
            requiereAprobacion: false,
            MovimientoEstados.Aplicado,
            request.Observaciones,
            request.ModuloOrigen,
            request.EntidadOrigen,
            request.ReferenciaId,
            request.ProveedorId,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            var producto = await GetProductoAsync(linea.ProductoId, cancellationToken);
            var lote = await ResolveOrCreateLoteAsync(
                producto,
                linea,
                request.ProveedorId,
                cancellationToken);

            await ApplyStockDeltaAsync(producto.Id, lote.Id, linea.Cantidad, cancellationToken);

            movimiento.Detalles.Add(new MovimientoDetalle
            {
                Id = Guid.NewGuid(),
                MovimientoId = movimiento.Id,
                ProductoId = producto.Id,
                LoteId = lote.Id,
                Cantidad = linea.Cantidad,
                CostoUnitario = linea.CostoUnitario,
                CreatedAt = DateTime.UtcNow,
            });
        }

        context.Movimientos.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    public async Task<MovimientoResponse> RegistrarSalidaAsync(
        RegistrarSalidaRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var movimiento = await CreateMovimientoHeaderAsync(
            MovimientoTipos.Salida,
            requiereAprobacion: false,
            MovimientoEstados.Aplicado,
            request.Observaciones,
            request.ModuloOrigen,
            request.EntidadOrigen,
            request.ReferenciaId,
            null,
            cancellationToken);

        foreach (var linea in request.Lineas)
        {
            if (request.UsarFefo || linea.LoteId is null)
            {
                var allocations = await AllocateFefoAsync(linea.ProductoId, linea.Cantidad, cancellationToken);
                foreach (var alloc in allocations)
                {
                    await ApplyStockDeltaAsync(linea.ProductoId, alloc.LoteId, -alloc.Cantidad, cancellationToken);
                    movimiento.Detalles.Add(new MovimientoDetalle
                    {
                        Id = Guid.NewGuid(),
                        MovimientoId = movimiento.Id,
                        ProductoId = linea.ProductoId,
                        LoteId = alloc.LoteId,
                        Cantidad = alloc.Cantidad,
                        CreatedAt = DateTime.UtcNow,
                    });
                }
            }
            else
            {
                await ApplyStockDeltaAsync(linea.ProductoId, linea.LoteId.Value, -linea.Cantidad, cancellationToken);
                movimiento.Detalles.Add(new MovimientoDetalle
                {
                    Id = Guid.NewGuid(),
                    MovimientoId = movimiento.Id,
                    ProductoId = linea.ProductoId,
                    LoteId = linea.LoteId,
                    Cantidad = linea.Cantidad,
                    CreatedAt = DateTime.UtcNow,
                });
            }
        }

        context.Movimientos.Add(movimiento);
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
                UsarFefo: true),
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

    public Task<MovimientoResponse> RegistrarAjusteAsync(
        RegistrarAjusteRequest request,
        CancellationToken cancellationToken = default) =>
        CreatePendingApprovalMovimientoAsync(
            MovimientoTipos.Ajuste,
            request.Lineas,
            request.Observaciones,
            request.EmpleadoId,
            cancellationToken);

    public Task<MovimientoResponse> RegistrarBajaAsync(
        RegistrarBajaRequest request,
        CancellationToken cancellationToken = default) =>
        CreatePendingApprovalMovimientoAsync(
            MovimientoTipos.Baja,
            request.Lineas,
            request.Observaciones,
            request.EmpleadoId,
            cancellationToken);

    public Task<MovimientoResponse> RegistrarTransferenciaAsync(
        RegistrarTransferenciaRequest request,
        CancellationToken cancellationToken = default) =>
        CreatePendingApprovalMovimientoAsync(
            MovimientoTipos.Transferencia,
            request.Lineas,
            request.Observaciones,
            request.EmpleadoId,
            cancellationToken);

    public async Task<MovimientoResponse> AplicarMovimientoAsync(
        Guid movimientoId,
        AplicarMovimientoRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var movimiento = await context.Movimientos
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == movimientoId, cancellationToken)
            ?? throw new NotFoundException("Movimiento no encontrado.");

        if (movimiento.Estado == MovimientoEstados.Aplicado)
            return (await GetMovimientoByIdAsync(movimientoId, cancellationToken))!;

        if (movimiento.RequiereAprobacion
            && movimiento.Estado is not (MovimientoEstados.Aprobado or MovimientoEstados.PendienteAprobacion))
        {
            throw new BusinessException(
                $"El movimiento no puede aplicarse en estado {movimiento.Estado}.");
        }

        foreach (var detalle in movimiento.Detalles)
        {
            if (detalle.LoteId is null)
                throw new BusinessException("El detalle del movimiento no tiene lote asignado.");

            var delta = movimiento.Tipo switch
            {
                MovimientoTipos.Ingreso or MovimientoTipos.Ajuste when detalle.Cantidad > 0 => detalle.Cantidad,
                MovimientoTipos.Ajuste when detalle.Cantidad < 0 => detalle.Cantidad,
                MovimientoTipos.Salida or MovimientoTipos.Baja or MovimientoTipos.Transferencia
                    => -Math.Abs(detalle.Cantidad),
                _ => detalle.Cantidad,
            };

            // Transferencia: cantidades positivas suman, negativas restan (ya vienen firmadas).
            if (movimiento.Tipo == MovimientoTipos.Transferencia)
                delta = detalle.Cantidad;

            if (movimiento.Tipo == MovimientoTipos.Ajuste)
                delta = detalle.Cantidad;

            await ApplyStockDeltaAsync(detalle.ProductoId, detalle.LoteId.Value, delta, cancellationToken);
        }

        movimiento.Estado = MovimientoEstados.Aplicado;
        movimiento.UpdatedAt = DateTime.UtcNow;

        if (movimiento.WorkflowInstanceId.HasValue && request?.EmpleadoId is Guid empId && empId != Guid.Empty)
        {
            try
            {
                await workflowInstanceService.ExecuteAsync(
                    movimiento.WorkflowInstanceId.Value,
                    new ExecuteWorkflowTransitionRequest("APLICAR", empId, "Movimiento aplicado a stock."),
                    cancellationToken);
            }
            catch
            {
                // El stock ya se aplicó; el estado de workflow puede sincronizarse aparte.
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return (await GetMovimientoByIdAsync(movimientoId, cancellationToken))!;
    }

    public async Task<MovimientoResponse?> GetMovimientoByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var movimiento = await context.Movimientos
            .AsNoTracking()
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return movimiento is null ? null : MapMovimiento(movimiento);
    }

    public async Task<PagedResult<MovimientoListItemResponse>> GetMovimientosPagedAsync(
        MovimientoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Movimientos.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Tipo))
            query = query.Where(x => x.Tipo == request.Tipo.Trim().ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());

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
                x.Tipo,
                x.Fecha,
                x.Estado,
                x.RequiereAprobacion,
                x.WorkflowInstanceId))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task SetMovimientoEstadoAsync(
        Guid movimientoId,
        string estado,
        CancellationToken cancellationToken = default)
    {
        var movimiento = await context.Movimientos
            .FirstOrDefaultAsync(x => x.Id == movimientoId, cancellationToken)
            ?? throw new NotFoundException("Movimiento no encontrado.");

        movimiento.Estado = estado.Trim().ToUpperInvariant();
        movimiento.UpdatedAt = DateTime.UtcNow;

        if (movimiento.Estado == MovimientoEstados.Aprobado)
            await AplicarMovimientoAsync(movimientoId, null, cancellationToken);
        else
            await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<MovimientoResponse> CreatePendingApprovalMovimientoAsync(
        string tipo,
        IReadOnlyList<MovimientoDetalleLineaRequest> lineas,
        string? observaciones,
        Guid? empleadoId,
        CancellationToken cancellationToken)
    {
        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var movimiento = await CreateMovimientoHeaderAsync(
            tipo,
            requiereAprobacion: true,
            MovimientoEstados.PendienteAprobacion,
            observaciones,
            null,
            null,
            null,
            null,
            cancellationToken);

        foreach (var linea in lineas)
        {
            await GetProductoAsync(linea.ProductoId, cancellationToken);

            Guid? loteId = linea.LoteId;
            if (loteId is null && !string.IsNullOrWhiteSpace(linea.NumeroLote))
            {
                var lote = await ResolveOrCreateLoteAsync(
                    await GetProductoAsync(linea.ProductoId, cancellationToken),
                    linea,
                    null,
                    cancellationToken);
                loteId = lote.Id;
            }

            if (loteId is null)
                throw new BusinessException("Debe indicar el lote para movimientos con aprobación.");

            movimiento.Detalles.Add(new MovimientoDetalle
            {
                Id = Guid.NewGuid(),
                MovimientoId = movimiento.Id,
                ProductoId = linea.ProductoId,
                LoteId = loteId,
                Cantidad = linea.Cantidad,
                CostoUnitario = linea.CostoUnitario,
                CreatedAt = DateTime.UtcNow,
            });
        }

        context.Movimientos.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);

        if (empleadoId is Guid emp && emp != Guid.Empty)
        {
            try
            {
                var instance = await workflowInstanceService.StartAsync(
                    new StartWorkflowInstanceRequest(
                        WorkflowDefinitionCode,
                        "Almacen",
                        "Movimiento",
                        movimiento.Id,
                        emp),
                    cancellationToken);

                movimiento.WorkflowInstanceId = instance.Id;

                await workflowInstanceService.ExecuteAsync(
                    instance.Id,
                    new ExecuteWorkflowTransitionRequest(
                        "SOLICITAR_APROBACION",
                        emp,
                        observaciones),
                    cancellationToken);

                await context.SaveChangesAsync(cancellationToken);
            }
            catch
            {
                // Workflow puede no estar seedado aún; el movimiento queda pendiente.
            }
        }

        await tx.CommitAsync(cancellationToken);
        return (await GetMovimientoByIdAsync(movimiento.Id, cancellationToken))!;
    }

    private async Task<Movimiento> CreateMovimientoHeaderAsync(
        string tipo,
        bool requiereAprobacion,
        string estado,
        string? observaciones,
        string? moduloOrigen,
        string? entidadOrigen,
        Guid? referenciaId,
        Guid? proveedorId,
        CancellationToken cancellationToken)
    {
        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "ALM-", Longitud: 6),
            cancellationToken);

        return new Movimiento
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            Tipo = tipo,
            Fecha = DateTime.UtcNow,
            Estado = estado,
            Observaciones = observaciones,
            ModuloOrigen = moduloOrigen,
            EntidadOrigen = entidadOrigen,
            ReferenciaId = referenciaId,
            ProveedorId = proveedorId,
            RequiereAprobacion = requiereAprobacion,
            CreatedAt = DateTime.UtcNow,
        };
    }

    private async Task<Producto> GetProductoAsync(Guid productoId, CancellationToken cancellationToken)
    {
        return await context.Productos
            .FirstOrDefaultAsync(x => x.Id == productoId && x.Activo, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado o inactivo.");
    }

    private async Task<Lote> ResolveOrCreateLoteAsync(
        Producto producto,
        MovimientoDetalleLineaRequest linea,
        Guid? proveedorId,
        CancellationToken cancellationToken)
    {
        if (linea.LoteId.HasValue)
        {
            return await context.Lotes
                .FirstOrDefaultAsync(x => x.Id == linea.LoteId.Value && x.ProductoId == producto.Id, cancellationToken)
                ?? throw new NotFoundException("Lote no encontrado.");
        }

        var numero = string.IsNullOrWhiteSpace(linea.NumeroLote)
            ? $"AUTO-{DateTime.UtcNow:yyyyMMddHHmmss}"
            : linea.NumeroLote.Trim();

        var existing = await context.Lotes
            .FirstOrDefaultAsync(
                x => x.ProductoId == producto.Id && x.Numero == numero,
                cancellationToken);

        if (existing is not null)
            return existing;

        var lote = new Lote
        {
            Id = Guid.NewGuid(),
            ProductoId = producto.Id,
            Numero = numero,
            FechaVencimiento = linea.FechaVencimiento,
            FechaIngreso = DateTime.UtcNow,
            ProveedorId = proveedorId,
            CreatedAt = DateTime.UtcNow,
        };

        context.Lotes.Add(lote);
        return lote;
    }

    private async Task ApplyStockDeltaAsync(
        Guid productoId,
        Guid loteId,
        decimal delta,
        CancellationToken cancellationToken)
    {
        var existencia = await context.Existencias
            .FirstOrDefaultAsync(x => x.LoteId == loteId, cancellationToken);

        if (existencia is null)
        {
            if (delta < 0)
                throw new BusinessException("No hay existencia suficiente para el lote indicado.");

            existencia = new Existencia
            {
                Id = Guid.NewGuid(),
                ProductoId = productoId,
                LoteId = loteId,
                Cantidad = 0,
                CreatedAt = DateTime.UtcNow,
            };
            context.Existencias.Add(existencia);
        }

        var nueva = existencia.Cantidad + delta;
        if (nueva < 0)
            throw new BusinessException("No se permite stock negativo.");

        existencia.Cantidad = nueva;
        existencia.UpdatedAt = DateTime.UtcNow;
    }

    private async Task<List<(Guid LoteId, decimal Cantidad)>> AllocateFefoAsync(
        Guid productoId,
        decimal cantidad,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var lotes = await context.Existencias
            .Include(x => x.Lote)
            .Where(x => x.ProductoId == productoId && x.Cantidad > 0)
            .Where(x => x.Lote.FechaVencimiento == null || x.Lote.FechaVencimiento >= today)
            .OrderBy(x => x.Lote.FechaVencimiento ?? DateOnly.MaxValue)
            .ThenBy(x => x.Lote.FechaIngreso)
            .ToListAsync(cancellationToken);

        var restante = cantidad;
        var result = new List<(Guid, decimal)>();

        foreach (var existencia in lotes)
        {
            if (restante <= 0)
                break;

            var tomar = Math.Min(existencia.Cantidad, restante);
            result.Add((existencia.LoteId, tomar));
            restante -= tomar;
        }

        if (restante > 0)
            throw new BusinessException(
                "Stock insuficiente o solo hay lotes vencidos para el producto solicitado.");

        return result;
    }

    private static MovimientoResponse MapMovimiento(Movimiento movimiento) =>
        new(
            movimiento.Id,
            movimiento.Numero,
            movimiento.Tipo,
            movimiento.Fecha,
            movimiento.Estado,
            movimiento.Observaciones,
            movimiento.ModuloOrigen,
            movimiento.EntidadOrigen,
            movimiento.ReferenciaId,
            movimiento.ProveedorId,
            movimiento.WorkflowInstanceId,
            movimiento.RequiereAprobacion,
            movimiento.Detalles.Select(d => new MovimientoDetalleResponse(
                d.Id,
                d.ProductoId,
                d.Producto?.Codigo ?? string.Empty,
                d.Producto?.Nombre ?? string.Empty,
                d.LoteId,
                d.Lote?.Numero,
                d.Cantidad,
                d.CostoUnitario)).ToList());
}
