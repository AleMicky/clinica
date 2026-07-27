using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Pagos;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class CajaPagoService(
    CajaDbContext context,
    ICurrentUser currentUser,
    ICorrelativoService correlativoService,
    IWorkflowInstanceService workflowInstanceService,
    IAtencionService atencionService,
    ISolicitudService solicitudService,
    ILogger<CajaPagoService> logger) : ICajaPagoService
{
    public const string ConceptoCobroAtencion = "COBRO_ATENCION";
    public const string ConceptoCobroLaboratorio = "COBRO_LABORATORIO";
    public const string ConceptoOtroIngreso = "OTRO_INGRESO";

    public async Task<PagoDetalleCompletoResponse> RegistrarPagoAsync(
        RegistrarPagoRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new BusinessException("Usuario no autenticado.");

        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var turno = await context.TurnosCaja
            .FirstOrDefaultAsync(
                x => x.UsuarioAperturaId == userId && x.Estado == TurnoCajaEstados.Abierto,
                cancellationToken)
            ?? throw new BusinessException("Debe tener un turno de caja abierto para registrar cobros.");

        var cuenta = await context.Cuentas
            .Include(x => x.Cargos)
            .Include(x => x.Pagos)
            .FirstOrDefaultAsync(x => x.Id == request.CuentaId, cancellationToken)
            ?? throw new NotFoundException("Cuenta no encontrada.");

        if (cuenta.Estado is CuentaEstados.Anulada or CuentaEstados.Pagada)
            throw new BusinessException($"No se puede registrar pago en una cuenta {cuenta.Estado.ToLowerInvariant()}.");

        var importe = Math.Round(request.Detalles.Sum(d => d.Importe), 2, MidpointRounding.AwayFromZero);
        if (importe <= 0)
            throw new BusinessException("El importe del pago debe ser mayor a cero.");

        if (importe > cuenta.Saldo)
            throw new BusinessException("El monto del pago no puede superar el saldo de la cuenta.");

        var metodoIds = request.Detalles.Select(d => d.MetodoPagoId).Distinct().ToList();
        var metodos = await context.MetodosPago
            .Where(x => metodoIds.Contains(x.Id) && x.Activo)
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        if (metodos.Count != metodoIds.Count)
            throw new BusinessException("Uno o más métodos de pago no son válidos.");

        foreach (var detalle in request.Detalles)
        {
            var metodo = metodos[detalle.MetodoPagoId];
            if (metodo.RequiereReferencia && string.IsNullOrWhiteSpace(detalle.NumeroReferencia))
                throw new BusinessException($"El método {metodo.Nombre} requiere número de referencia.");
        }

        var correlativoPago = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest("CAJA_PAGO", Prefijo: "PAG-", Longitud: 6),
            cancellationToken);

        var pago = new Pago
        {
            Id = Guid.NewGuid(),
            CuentaId = cuenta.Id,
            Numero = correlativoPago.NumeroFormateado,
            PacienteId = cuenta.PacienteId,
            TurnoCajaId = turno.Id,
            FechaPago = DateTime.UtcNow,
            Monto = importe,
            MetodoPago = request.Detalles.Count == 1
                ? metodos[request.Detalles[0].MetodoPagoId].Codigo
                : "MIXTO",
            Estado = PagoEstados.Confirmado,
            Observaciones = string.IsNullOrWhiteSpace(request.Observaciones)
                ? null
                : request.Observaciones.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserName,
        };

        foreach (var d in request.Detalles)
        {
            pago.Detalles.Add(new PagoDetalle
            {
                Id = Guid.NewGuid(),
                MetodoPagoId = d.MetodoPagoId,
                Importe = Math.Round(d.Importe, 2, MidpointRounding.AwayFromZero),
                NumeroReferencia = string.IsNullOrWhiteSpace(d.NumeroReferencia) ? null : d.NumeroReferencia.Trim(),
                Observaciones = string.IsNullOrWhiteSpace(d.Observaciones) ? null : d.Observaciones.Trim(),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUser.UserName,
            });
        }

        pago.Aplicaciones.Add(new AplicacionPago
        {
            Id = Guid.NewGuid(),
            CuentaId = cuenta.Id,
            ImporteAplicado = importe,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserName,
        });

        var conceptoCodigo = string.Equals(cuenta.ModuloOrigen, "AtencionMedica", StringComparison.OrdinalIgnoreCase)
            ? ConceptoCobroAtencion
            : string.Equals(cuenta.ModuloOrigen, "Laboratorio", StringComparison.OrdinalIgnoreCase)
                ? ConceptoCobroLaboratorio
                : ConceptoOtroIngreso;

        var concepto = await context.ConceptosCaja
            .FirstOrDefaultAsync(x => x.Codigo == conceptoCodigo && x.Activo, cancellationToken)
            ?? await context.ConceptosCaja.FirstAsync(x => x.Codigo == ConceptoOtroIngreso, cancellationToken);

        foreach (var d in pago.Detalles)
        {
            var correlativoMov = await correlativoService.GenerarAsync(
                new GenerarCorrelativoRequest("CAJA_MOVIMIENTO", Prefijo: "MOV-", Longitud: 6),
                cancellationToken);

            context.MovimientosCaja.Add(new MovimientoCaja
            {
                Id = Guid.NewGuid(),
                Numero = correlativoMov.NumeroFormateado,
                TurnoCajaId = turno.Id,
                ConceptoCajaId = concepto.Id,
                TipoMovimiento = TipoMovimientoCaja.Ingreso,
                Fecha = DateTime.UtcNow,
                Importe = d.Importe,
                MetodoPagoId = d.MetodoPagoId,
                PagoId = pago.Id,
                ModuloOrigen = cuenta.ModuloOrigen,
                ReferenciaId = cuenta.ReferenciaId,
                Descripcion = $"Cobro cuenta {cuenta.Numero}",
                Estado = MovimientoCajaEstados.Confirmado,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUser.UserName,
            });
        }

        var correlativoRecibo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest("CAJA_RECIBO", Prefijo: "REC-", Longitud: 6),
            cancellationToken);

        pago.Recibo = new Recibo
        {
            Id = Guid.NewGuid(),
            Numero = correlativoRecibo.NumeroFormateado,
            PacienteId = cuenta.PacienteId,
            FechaEmision = DateTime.UtcNow,
            Importe = importe,
            Estado = ReciboEstados.Emitido,
            Observaciones = pago.Observaciones,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserName,
        };

        context.Pagos.Add(pago);
        cuenta.Pagos.Add(pago);
        CajaCargoService.RecalcularTotales(cuenta);
        cuenta.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        await NotificarPagoCompletoAsync(cuenta, request.EmpleadoId, cancellationToken);

        return await GetByIdAsync(pago.Id, cancellationToken)
            ?? throw new NotFoundException("Pago no encontrado tras registro.");
    }

    public async Task<PagedResult<PagoListItemResponse>> GetPagedAsync(
        PagoPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Pagos.AsNoTracking().AsQueryable();

        if (request.PacienteId.HasValue)
            query = query.Where(x => x.PacienteId == request.PacienteId.Value);
        if (request.CuentaId.HasValue)
            query = query.Where(x => x.CuentaId == request.CuentaId.Value);
        if (request.TurnoCajaId.HasValue)
            query = query.Where(x => x.TurnoCajaId == request.TurnoCajaId.Value);
        if (!string.IsNullOrWhiteSpace(request.Estado))
            query = query.Where(x => x.Estado == request.Estado.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.FechaPago)
            .Select(x => new PagoListItemResponse(
                x.Id,
                x.Numero,
                x.PacienteId,
                x.CuentaId,
                x.TurnoCajaId,
                x.FechaPago,
                x.Monto,
                x.Estado,
                x.Observaciones))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<PagoDetalleCompletoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var pago = await context.Pagos.AsNoTracking()
            .Include(x => x.Detalles).ThenInclude(d => d.MetodoPago)
            .Include(x => x.Aplicaciones).ThenInclude(a => a.Cuenta)
            .Include(x => x.Recibo)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return pago is null ? null : Map(pago);
    }

    public async Task AnularAsync(
        Guid id,
        AnularPagoRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = currentUser.UserId
            ?? throw new BusinessException("Usuario no autenticado.");

        await using var tx = await context.Database.BeginTransactionAsync(cancellationToken);

        var pago = await context.Pagos
            .Include(x => x.Detalles)
            .Include(x => x.Recibo)
            .Include(x => x.Cuenta).ThenInclude(c => c.Cargos)
            .Include(x => x.Cuenta).ThenInclude(c => c.Pagos)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Pago no encontrado.");

        if (pago.Estado == PagoEstados.Anulado)
            throw new BusinessException("El pago ya está anulado.");

        if (pago.TurnoCajaId is null)
            throw new BusinessException("No se puede anular un pago sin turno asociado.");

        var turno = await context.TurnosCaja.FirstOrDefaultAsync(
            x => x.Id == pago.TurnoCajaId, cancellationToken);

        if (turno is null || turno.Estado != TurnoCajaEstados.Abierto)
            throw new BusinessException("Solo se pueden anular pagos del turno abierto actual.");

        pago.Estado = PagoEstados.Anulado;
        pago.Observaciones = string.IsNullOrWhiteSpace(pago.Observaciones)
            ? $"ANULADO: {request.Motivo.Trim()}"
            : $"{pago.Observaciones} | ANULADO: {request.Motivo.Trim()}";
        pago.UpdatedAt = DateTime.UtcNow;
        pago.UpdatedBy = currentUser.UserName;

        if (pago.Recibo is not null)
        {
            pago.Recibo.Estado = ReciboEstados.Anulado;
            pago.Recibo.UpdatedAt = DateTime.UtcNow;
        }

        var movimientos = await context.MovimientosCaja
            .Where(x => x.PagoId == pago.Id && x.Estado == MovimientoCajaEstados.Confirmado)
            .ToListAsync(cancellationToken);

        foreach (var mov in movimientos)
        {
            mov.Estado = MovimientoCajaEstados.Reversado;
            mov.UpdatedAt = DateTime.UtcNow;

            var correlativo = await correlativoService.GenerarAsync(
                new GenerarCorrelativoRequest("CAJA_MOVIMIENTO", Prefijo: "MOV-", Longitud: 6),
                cancellationToken);

            context.MovimientosCaja.Add(new MovimientoCaja
            {
                Id = Guid.NewGuid(),
                Numero = correlativo.NumeroFormateado,
                TurnoCajaId = mov.TurnoCajaId,
                ConceptoCajaId = mov.ConceptoCajaId,
                TipoMovimiento = TipoMovimientoCaja.Egreso,
                Fecha = DateTime.UtcNow,
                Importe = mov.Importe,
                MetodoPagoId = mov.MetodoPagoId,
                PagoId = pago.Id,
                ModuloOrigen = mov.ModuloOrigen,
                ReferenciaId = mov.ReferenciaId,
                Descripcion = $"Reversión {mov.Numero}: {request.Motivo.Trim()}",
                Estado = MovimientoCajaEstados.Confirmado,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUser.UserName,
            });
        }

        CajaCargoService.RecalcularTotales(pago.Cuenta);
        pago.Cuenta.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
    }

    public async Task<ReciboResponse?> GetReciboAsync(Guid pagoId, CancellationToken cancellationToken = default)
    {
        var recibo = await context.Recibos.AsNoTracking()
            .FirstOrDefaultAsync(x => x.PagoId == pagoId, cancellationToken);
        return recibo is null
            ? null
            : new ReciboResponse(
                recibo.Id,
                recibo.Numero,
                recibo.PagoId,
                recibo.PacienteId,
                recibo.FechaEmision,
                recibo.Importe,
                recibo.Estado,
                recibo.Observaciones);
    }

    private async Task NotificarPagoCompletoAsync(
        Cuenta cuenta,
        Guid? empleadoId,
        CancellationToken cancellationToken)
    {
        if (cuenta.Estado != CuentaEstados.Pagada)
            return;

        if (cuenta.WorkflowInstanceId.HasValue)
        {
            try
            {
                await workflowInstanceService.ExecuteAsync(
                    cuenta.WorkflowInstanceId.Value,
                    new ExecuteWorkflowTransitionRequest(
                        "REGISTRAR_PAGO",
                        empleadoId ?? Guid.Empty,
                        "Pago registrado en caja."),
                    cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Cuenta {CuentaId} pagada pero no se pudo ejecutar REGISTRAR_PAGO en workflow {WorkflowInstanceId}.",
                    cuenta.Id,
                    cuenta.WorkflowInstanceId);
            }
        }

        if (string.Equals(cuenta.ModuloOrigen, "AtencionMedica", StringComparison.OrdinalIgnoreCase)
            && string.Equals(cuenta.EntidadOrigen, "Atencion", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                await atencionService.SetEstadoAsync(cuenta.ReferenciaId, "PAGADO", cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Cuenta {CuentaId} pagada pero no se pudo actualizar estado de atención {ReferenciaId}.",
                    cuenta.Id,
                    cuenta.ReferenciaId);
            }
        }

        if (string.Equals(cuenta.ModuloOrigen, "Laboratorio", StringComparison.OrdinalIgnoreCase)
            && string.Equals(cuenta.EntidadOrigen, "Solicitud", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                await solicitudService.SetEstadoAsync(
                    cuenta.ReferenciaId,
                    "PENDIENTE_MUESTRA",
                    cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Cuenta {CuentaId} pagada pero no se pudo actualizar estado de solicitud de laboratorio {ReferenciaId}.",
                    cuenta.Id,
                    cuenta.ReferenciaId);
            }
        }
    }

    private static PagoDetalleCompletoResponse Map(Pago pago)
    {
        var detalles = pago.Detalles
            .Where(d => !d.IsDeleted)
            .Select(d => new PagoDetalleItemResponse(
                d.Id,
                d.MetodoPagoId,
                d.MetodoPago.Codigo,
                d.MetodoPago.Nombre,
                d.Importe,
                d.NumeroReferencia,
                d.Observaciones))
            .ToList();

        var aplicaciones = pago.Aplicaciones
            .Where(a => !a.IsDeleted)
            .Select(a => new AplicacionPagoResponse(
                a.Id,
                a.CuentaId,
                a.Cuenta.Numero,
                a.ImporteAplicado))
            .ToList();

        ReciboResponse? recibo = pago.Recibo is null
            ? null
            : new ReciboResponse(
                pago.Recibo.Id,
                pago.Recibo.Numero,
                pago.Recibo.PagoId,
                pago.Recibo.PacienteId,
                pago.Recibo.FechaEmision,
                pago.Recibo.Importe,
                pago.Recibo.Estado,
                pago.Recibo.Observaciones);

        return new PagoDetalleCompletoResponse(
            pago.Id,
            pago.Numero,
            pago.PacienteId,
            pago.CuentaId,
            pago.TurnoCajaId,
            pago.FechaPago,
            pago.Monto,
            pago.Estado,
            pago.Observaciones,
            pago.CreatedAt,
            detalles,
            aplicaciones,
            recibo);
    }
}
