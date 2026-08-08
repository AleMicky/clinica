using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Dtos;
using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Modules.Ventas.Venta.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using VentaEntity = Clinica.Api.Modules.Ventas.Venta.Entity.Venta;
using VentaDetalleEntity = Clinica.Api.Modules.Ventas.Venta.Entity.VentaDetalle;

namespace Clinica.Api.Modules.Ventas.Venta.Services;

public sealed class VentaDetalleService(AppDbContext dbContext)
{
    public async Task<PagedResult<VentaDetalleResponse>> ListarAsync(
        int ventaId,
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        await EnsureVentaExistsAsync(ventaId, cancellationToken);

        var query = dbContext.VentaDetalles
            .AsNoTracking()
            .Include(x => x.Servicio)
            .Where(x => x.VentaId == ventaId && x.Activo);

        var normalizedSearch = string.IsNullOrWhiteSpace(search)
            ? null
            : search.Trim();

        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Servicio.Codigo.Contains(normalizedSearch) ||
                x.Servicio.Nombre.Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var offset = (pagination.ValidPage - 1)
                     * pagination.ValidPageSize;

        var entities = await query
            .OrderBy(x => x.Servicio.Nombre)
            .ThenBy(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<VentaDetalleResponse>(
            VentaDetalleMapper.ToResponse(entities),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<VentaDetalleResponse> ObtenerAsync(
        int ventaId,
        int detalleId,
        CancellationToken cancellationToken = default)
    {
        await EnsureVentaExistsAsync(ventaId, cancellationToken);

        var entity = await dbContext.VentaDetalles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.VentaId == ventaId
                     && x.Id == detalleId
                     && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(VentaDetalleEntity), detalleId);

        return VentaDetalleMapper.ToResponse(entity);
    }

    public async Task<VentaDetalleResponse> CrearAsync(
        int ventaId,
        CreateVentaDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        var venta = await ObtenerVentaEditableAsync(ventaId, cancellationToken);
        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        var existe = await dbContext.VentaDetalles.AnyAsync(
            x => x.VentaId == ventaId
                 && x.ServicioId == request.ServicioId
                 && x.Activo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"El servicio '{request.ServicioId}' ya está incluido en la venta.");
        }

        var entity = VentaDetalleMapper.ToEntity(request);
        entity.VentaId = ventaId;
        entity.Activo = true;
        AplicarImportes(entity, request);

        await dbContext.VentaDetalles.AddAsync(entity, cancellationToken);
        await RecalcularTotalesYGuardarAsync(venta, cancellationToken);

        return VentaDetalleMapper.ToResponse(entity);
    }

    public async Task<VentaDetalleResponse> ActualizarAsync(
        int ventaId,
        int detalleId,
        UpdateVentaDetalleRequest request,
        CancellationToken cancellationToken = default)
    {
        var venta = await ObtenerVentaEditableAsync(ventaId, cancellationToken);
        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        var entity = venta.Detalles
            .FirstOrDefault(x => x.Id == detalleId && x.Activo);

        if (entity is null)
            throw new NotFoundException(nameof(VentaDetalleEntity), detalleId);

        var existe = venta.Detalles.Any(x =>
            x.Id != detalleId
            && x.ServicioId == request.ServicioId
            && x.Activo);

        if (existe)
        {
            throw new ConflictException(
                $"El servicio '{request.ServicioId}' ya está incluido en la venta.");
        }

        VentaDetalleMapper.UpdateEntity(request, entity);
        entity.ServicioId = request.ServicioId;
        entity.MedicoId = request.MedicoId;
        AplicarImportes(entity, request);

        await RecalcularTotalesYGuardarAsync(venta, cancellationToken);

        return VentaDetalleMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int ventaId,
        int detalleId,
        CancellationToken cancellationToken = default)
    {
        var venta = await ObtenerVentaEditableAsync(ventaId, cancellationToken);

        var entity = venta.Detalles
            .FirstOrDefault(x => x.Id == detalleId && x.Activo);

        if (entity is null)
            throw new NotFoundException(nameof(VentaDetalleEntity), detalleId);

        entity.Activo = false;

        await RecalcularTotalesYGuardarAsync(venta, cancellationToken);
    }

    private async Task<VentaEntity> ObtenerVentaEditableAsync(
        int ventaId,
        CancellationToken cancellationToken)
    {
        var venta = await dbContext.Ventas
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(
                x => x.Id == ventaId && x.Activo,
                cancellationToken);

        if (venta is null)
            throw new NotFoundException(nameof(VentaEntity), ventaId);

        if (venta.Estado == EstadoVenta.Anulada)
        {
            throw new ConflictException(
                "No se puede modificar una venta anulada.");
        }

        return venta;
    }

    private async Task EnsureVentaExistsAsync(
        int ventaId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Ventas
            .AnyAsync(x => x.Id == ventaId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(VentaEntity), ventaId);
    }

    private async Task EnsureServicioExistsAsync(
        int servicioId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Servicio
            .AnyAsync(x => x.Id == servicioId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Servicio), servicioId);
    }

    private async Task EnsureMedicoExistsAsync(
        int? medicoId,
        CancellationToken cancellationToken)
    {
        if (medicoId is null)
            return;

        var existe = await dbContext.Medicos
            .AnyAsync(x => x.Id == medicoId && x.Activo, cancellationToken);

        if (!existe)
            throw new NotFoundException(nameof(Medico), medicoId.Value);
    }

    private static void AplicarImportes(
        VentaDetalleEntity entity,
        VentaDetalleRequest request)
    {
        var total = VentaCalculos.TotalDetalle(request);
        var (montoMedico, montoClinica) = VentaCalculos.RepartoMedico(
            total,
            request.PorcentajeMedico);

        entity.Total = total;
        entity.MontoMedico = montoMedico;
        entity.MontoClinica = montoClinica;
    }

    private async Task RecalcularTotalesYGuardarAsync(
        VentaEntity venta,
        CancellationToken cancellationToken)
    {
        var detalles = venta.Detalles
            .Where(x => x.Activo)
            .ToList();

        venta.Subtotal = detalles.Sum(x => x.Cantidad * x.PrecioUnitario);
        venta.Descuento = detalles.Sum(x => x.Descuento);
        venta.Total = detalles.Sum(x => x.Total);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
