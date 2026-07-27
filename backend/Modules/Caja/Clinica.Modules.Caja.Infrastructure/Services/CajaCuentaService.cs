using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cuentas;
using Clinica.Modules.Caja.Domain.Entities;
using Clinica.Modules.Caja.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Caja.Infrastructure.Services;

public sealed class CajaCuentaService(CajaDbContext context) : ICajaCuentaService
{
    public async Task<PagedResult<CuentaListItemResponse>> GetPagedAsync(
        CuentaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.Cuentas.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Estado))
        {
            var estado = request.Estado.Trim().ToUpperInvariant();
            query = query.Where(x => x.Estado == estado);
        }

        if (request.PacienteId.HasValue)
            query = query.Where(x => x.PacienteId == request.PacienteId.Value);

        if (!string.IsNullOrWhiteSpace(request.ModuloOrigen))
        {
            var modulo = request.ModuloOrigen.Trim();
            query = query.Where(x => x.ModuloOrigen == modulo);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        var paged = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CuentaListItemResponse(
                x.Id,
                x.Numero,
                x.PacienteId,
                x.ModuloOrigen,
                x.EntidadOrigen,
                x.ReferenciaId,
                x.WorkflowInstanceId,
                x.Estado,
                x.TotalCargos,
                x.TotalPagado,
                x.Saldo,
                x.CreatedAt))
            .ToPagedResultAsync(request, cancellationToken);

        return paged;
    }

    public async Task<CuentaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var cuenta = await context.Cuentas
            .AsNoTracking()
            .Include(x => x.Cargos)
            .Include(x => x.Pagos)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return cuenta is null ? null : CajaCargoService.MapCuenta(cuenta);
    }

    public async Task AnularAsync(
        Guid id,
        AnularCuentaRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        var cuenta = await context.Cuentas
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Cuenta no encontrada.");

        if (cuenta.Estado == CuentaEstados.Anulada)
            throw new BusinessException("La cuenta ya está anulada.");

        if (cuenta.Estado == CuentaEstados.Pagada)
            throw new BusinessException("No se puede anular una cuenta pagada.");

        if (cuenta.TotalPagado > 0)
            throw new BusinessException("No se puede anular una cuenta con pagos registrados.");

        cuenta.Estado = CuentaEstados.Anulada;
        if (!string.IsNullOrWhiteSpace(request?.Motivo))
        {
            cuenta.Observaciones = string.IsNullOrWhiteSpace(cuenta.Observaciones)
                ? $"ANULADA: {request.Motivo.Trim()}"
                : $"{cuenta.Observaciones} | ANULADA: {request.Motivo.Trim()}";
        }

        cuenta.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }
}
