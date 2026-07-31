using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cargos;
using Clinica.Modules.Farmacia.Application.Abstractions;
using Clinica.Modules.Farmacia.Application.Dispensaciones;
using Clinica.Modules.Farmacia.Domain.Entities;
using Clinica.Modules.Farmacia.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Farmacia.Infrastructure.Services;

public sealed class DispensacionService(
    FarmaciaDbContext context,
    ICorrelativoService correlativoService,
    IAlmacenStockService almacenStockService,
    IPrecioService precioService,
    ICajaCargoService cajaCargoService,
    IWorkflowInstanceService workflowInstanceService) : IDispensacionService
{
    public const string CorrelativoCodigo = "FAR_DISPENSACION";
    public const string WorkflowDefinitionCode = "FARMACIA_DISPENSACION";

    public async Task<PagedResult<DispensacionListItemResponse>> GetPagedAsync(
        DispensacionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Dispensaciones.AsNoTracking().AsQueryable();
        if (request.PacienteId.HasValue)
            query = query.Where(x => x.PacienteId == request.PacienteId.Value);
        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.Fecha)
            .Select(x => new DispensacionListItemResponse(
                x.Id, x.Numero, x.PacienteId, x.Fecha, x.Estado, x.CuentaId))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<DispensacionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Dispensaciones
            .AsNoTracking()
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<DispensacionResponse> CreateAsync(
        CreateDispensacionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.RecetaId.HasValue)
        {
            var receta = await context.Recetas
                .Include(x => x.Detalles)
                .FirstOrDefaultAsync(x => x.Id == request.RecetaId.Value, cancellationToken)
                ?? throw new NotFoundException("Receta no encontrada.");

            if (receta.Estado != RecetaEstados.Activa)
                throw new BusinessException("La receta no está activa.");
        }

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "DSP-", Longitud: 6),
            cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var detalles = new List<DispensacionDetalle>();

        foreach (var linea in request.Detalles)
        {
            var precio = await precioService.GetVigenteAsync(linea.ProductoId, today, cancellationToken)
                ?? throw new BusinessException($"No hay precio vigente para el producto {linea.ProductoId}.");

            var disponibilidad = await almacenStockService.ConsultarDisponibilidadAsync(
                linea.ProductoId, cancellationToken);

            if (disponibilidad.CantidadDisponible < linea.Cantidad)
                throw new BusinessException(
                    $"Stock insuficiente para {disponibilidad.ProductoNombre}. Disponible: {disponibilidad.CantidadDisponible}.");

            detalles.Add(new DispensacionDetalle
            {
                Id = Guid.NewGuid(),
                ProductoId = linea.ProductoId,
                Cantidad = linea.Cantidad,
                PrecioUnitario = precio.Importe,
                CreatedAt = DateTime.UtcNow,
            });
        }

        var entity = new Dispensacion
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            RecetaId = request.RecetaId,
            PacienteId = request.PacienteId,
            Fecha = DateTime.UtcNow,
            Estado = DispensacionEstados.Borrador,
            Observaciones = request.Observaciones,
            CreatedAt = DateTime.UtcNow,
            Detalles = detalles,
        };

        context.Dispensaciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        if (request.EmpleadoId is Guid emp && emp != Guid.Empty)
        {
            try
            {
                var instance = await workflowInstanceService.StartAsync(
                    new StartWorkflowInstanceRequest(
                        WorkflowDefinitionCode,
                        "Farmacia",
                        "Dispensacion",
                        entity.Id,
                        emp),
                    cancellationToken);
                entity.WorkflowInstanceId = instance.Id;
                await context.SaveChangesAsync(cancellationToken);
            }
            catch
            {
                // Workflow opcional si aún no está seedado.
            }
        }

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<DispensacionResponse> ConfirmarAsync(
        Guid id,
        ConfirmarDispensacionRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Dispensaciones
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Dispensación no encontrada.");

        if (entity.Estado != DispensacionEstados.Borrador)
            throw new BusinessException("Solo se pueden confirmar dispensaciones en borrador.");

        // Descontar FEFO por línea (puede generar varios lotes; se guarda el primero en detalle).
        foreach (var detalle in entity.Detalles.ToList())
        {
            var descuento = await almacenStockService.DescontarFefoAsync(
                new DescontarFefoRequest(
                    detalle.ProductoId,
                    detalle.Cantidad,
                    "Farmacia",
                    "Dispensacion",
                    entity.Id,
                    $"Dispensación {entity.Numero}"),
                cancellationToken);

            var primeraLinea = descuento.Lineas.FirstOrDefault();
            detalle.LoteId = primeraLinea?.LoteId;
            detalle.UpdatedAt = DateTime.UtcNow;

            // Si FEFO usó varios lotes, expandir detalles.
            if (descuento.Lineas.Count > 1)
            {
                detalle.Cantidad = descuento.Lineas[0].Cantidad;
                for (var i = 1; i < descuento.Lineas.Count; i++)
                {
                    var extra = descuento.Lineas[i];
                    entity.Detalles.Add(new DispensacionDetalle
                    {
                        Id = Guid.NewGuid(),
                        DispensacionId = entity.Id,
                        ProductoId = detalle.ProductoId,
                        Cantidad = extra.Cantidad,
                        PrecioUnitario = detalle.PrecioUnitario,
                        LoteId = extra.LoteId,
                        CreatedAt = DateTime.UtcNow,
                    });
                }
            }
        }

        var lineasCaja = entity.Detalles
            .GroupBy(d => d.ProductoId)
            .Select(g => new AgregarCargosLineaRequest(
                $"Medicamento {g.Key}",
                g.Key.ToString("N")[..8].ToUpperInvariant(),
                g.Sum(x => x.Cantidad),
                g.First().PrecioUnitario,
                g.Key))
            .ToList();

        var empleadoId = request?.EmpleadoId ?? Guid.Empty;
        Guid? workflowId = entity.WorkflowInstanceId;

        if (empleadoId != Guid.Empty)
        {
            try
            {
                if (workflowId is null)
                {
                    var instance = await workflowInstanceService.StartAsync(
                        new StartWorkflowInstanceRequest(
                            WorkflowDefinitionCode,
                            "Farmacia",
                            "Dispensacion",
                            entity.Id,
                            empleadoId),
                        cancellationToken);
                    workflowId = instance.Id;
                    entity.WorkflowInstanceId = instance.Id;
                }

                await workflowInstanceService.ExecuteAsync(
                    workflowId.Value,
                    new ExecuteWorkflowTransitionRequest(
                        "ENVIAR_CAJA",
                        empleadoId,
                        "Dispensación enviada a caja."),
                    cancellationToken);
            }
            catch
            {
                // Continuar cobro aunque falle workflow.
            }
        }

        var cuenta = await cajaCargoService.AgregarCargosAsync(
            new AgregarCargosRequest(
                entity.PacienteId,
                "Farmacia",
                "Dispensacion",
                entity.Id,
                workflowId,
                $"Dispensación {entity.Numero}",
                lineasCaja),
            cancellationToken);

        entity.CuentaId = cuenta.Id;
        entity.Estado = DispensacionEstados.PendientePago;
        entity.UpdatedAt = DateTime.UtcNow;

        if (entity.RecetaId.HasValue)
        {
            var receta = await context.Recetas.FirstOrDefaultAsync(
                x => x.Id == entity.RecetaId.Value, cancellationToken);
            if (receta is not null)
            {
                receta.Estado = RecetaEstados.Dispensada;
                receta.UpdatedAt = DateTime.UtcNow;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task SetEstadoAsync(
        Guid id,
        string estado,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Dispensaciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Dispensación no encontrada.");

        entity.Estado = estado.Trim().ToUpperInvariant();
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task AnularAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Dispensaciones
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Dispensación no encontrada.");

        if (entity.Estado == DispensacionEstados.Dispensada
            || entity.Estado == DispensacionEstados.Finalizado)
            throw new BusinessException("No se puede anular una dispensación ya cobrada.");

        if (entity.Estado == DispensacionEstados.PendientePago)
        {
            // Reversión de stock: ingreso compensatorio por cada detalle con lote.
            var lineas = entity.Detalles
                .Where(d => d.LoteId.HasValue)
                .Select(d => new MovimientoDetalleLineaRequest(
                    d.ProductoId,
                    d.LoteId,
                    d.Cantidad))
                .ToList();

            if (lineas.Count > 0)
            {
                await almacenStockService.RegistrarIngresoAsync(
                    new RegistrarIngresoRequest(
                        lineas,
                        Observaciones: $"Reversión anulación {entity.Numero}",
                        ModuloOrigen: "Farmacia",
                        EntidadOrigen: "Dispensacion",
                        ReferenciaId: entity.Id),
                    cancellationToken);
            }

            if (entity.CuentaId.HasValue)
            {
                // Anulación de cuenta se hace desde Caja; aquí solo marcamos estado.
            }
        }

        entity.Estado = DispensacionEstados.Anulado;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }

    private static DispensacionResponse Map(Dispensacion entity) =>
        new(
            entity.Id,
            entity.Numero,
            entity.RecetaId,
            entity.PacienteId,
            entity.Fecha,
            entity.Estado,
            entity.CuentaId,
            entity.WorkflowInstanceId,
            entity.Observaciones,
            entity.Detalles.Select(d => new DispensacionDetalleResponse(
                d.Id, d.ProductoId, d.Cantidad, d.PrecioUnitario, d.LoteId)).ToList());
}
