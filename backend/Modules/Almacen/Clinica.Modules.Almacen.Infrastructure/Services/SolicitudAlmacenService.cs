using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Solicitudes;
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

public sealed class SolicitudAlmacenService(
    AlmacenDbContext context,
    ICorrelativoService correlativoService,
    IAlmacenStockService stockService) : ISolicitudAlmacenService
{
    public const string CorrelativoCodigo = "ALM_SOLICITUD";

    public async Task<PagedResult<SolicitudListItemResponse>> GetPagedAsync(
        SolicitudPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.SolicitudesAlmacen
            .AsNoTracking()
            .Include(x => x.Almacen)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Estado)
            && Enum.TryParse<EstadoSolicitudAlmacen>(request.Estado, true, out var estado))
            query = query.Where(x => x.Estado == estado);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.FechaSolicitud)
            .Select(x => new SolicitudListItemResponse(
                x.Id,
                x.Numero,
                x.FechaSolicitud,
                x.Almacen.Nombre,
                x.Estado.ToString()))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<SolicitudResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadAsync(id, false, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<SolicitudResponse> CreateAsync(
        CreateSolicitudRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await context.Almacenes.AnyAsync(x => x.Id == request.AlmacenId, cancellationToken))
            throw new NotFoundException("Almacén no encontrado.");

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "SOL-", Longitud: 6),
            cancellationToken);

        var entity = new SolicitudAlmacen
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            FechaSolicitud = DateTime.UtcNow,
            AreaSolicitanteId = request.AreaSolicitanteId,
            EmpleadoSolicitanteId = request.EmpleadoSolicitanteId,
            AlmacenId = request.AlmacenId,
            Estado = EstadoSolicitudAlmacen.Borrador,
            Observacion = request.Observacion,
            CreatedAt = DateTime.UtcNow,
        };

        foreach (var d in request.Detalles)
        {
            if (!await context.Productos.AnyAsync(x => x.Id == d.ProductoId && x.Activo, cancellationToken))
                throw new NotFoundException("Producto no encontrado o inactivo.");

            entity.Detalles.Add(new SolicitudAlmacenDetalle
            {
                Id = Guid.NewGuid(),
                SolicitudAlmacenId = entity.Id,
                ProductoId = d.ProductoId,
                CantidadSolicitada = d.CantidadSolicitada,
                Observacion = d.Observacion,
                CreatedAt = DateTime.UtcNow,
            });
        }

        context.SolicitudesAlmacen.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<SolicitudResponse> SolicitarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoSolicitudAlmacen.Borrador);
        entity.Estado = EstadoSolicitudAlmacen.Solicitada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<SolicitudResponse> AprobarAsync(
        Guid id,
        AprobarSolicitudRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoSolicitudAlmacen.Solicitada);

        foreach (var item in request.Detalles)
        {
            var detalle = entity.Detalles.FirstOrDefault(x => x.Id == item.DetalleId)
                ?? throw new NotFoundException("Detalle de solicitud no encontrado.");
            if (item.CantidadAprobada > detalle.CantidadSolicitada)
                throw new BusinessException("La cantidad aprobada no puede superar la solicitada.");
            detalle.CantidadAprobada = item.CantidadAprobada;
            detalle.UpdatedAt = DateTime.UtcNow;
        }

        entity.Estado = EstadoSolicitudAlmacen.Aprobada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<SolicitudResponse> AtenderAsync(
        Guid id,
        AtenderSolicitudRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        if (entity.Estado is not (EstadoSolicitudAlmacen.Aprobada or EstadoSolicitudAlmacen.ParcialmenteAtendida))
            throw new BusinessException($"No se puede atender en estado {entity.Estado}.");

        var lineas = new List<MovimientoDetalleLineaRequest>();
        foreach (var item in request.Detalles)
        {
            var detalle = entity.Detalles.FirstOrDefault(x => x.Id == item.DetalleId)
                ?? throw new NotFoundException("Detalle de solicitud no encontrado.");

            var pendiente = detalle.CantidadAprobada - detalle.CantidadEntregada;
            if (item.CantidadEntregar > pendiente)
                throw new BusinessException("La cantidad a entregar supera lo pendiente de la solicitud.");

            detalle.CantidadEntregada += item.CantidadEntregar;
            detalle.UpdatedAt = DateTime.UtcNow;
            lineas.Add(new MovimientoDetalleLineaRequest(detalle.ProductoId, null, item.CantidadEntregar));
        }

        await stockService.RegistrarSalidaAsync(
            new RegistrarSalidaRequest(
                lineas,
                $"Atención solicitud {entity.Numero}",
                "Almacen",
                "SolicitudAlmacen",
                entity.Id,
                UsarFefo: true,
                entity.AlmacenId),
            cancellationToken);

        var completa = entity.Detalles.All(d => d.CantidadEntregada >= d.CantidadAprobada);
        entity.Estado = completa
            ? EstadoSolicitudAlmacen.Atendida
            : EstadoSolicitudAlmacen.ParcialmenteAtendida;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<SolicitudResponse> RechazarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoSolicitudAlmacen.Solicitada);
        entity.Estado = EstadoSolicitudAlmacen.Rechazada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<SolicitudResponse> AnularAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        if (entity.Estado is not (EstadoSolicitudAlmacen.Borrador or EstadoSolicitudAlmacen.Solicitada))
            throw new BusinessException($"No se puede anular en estado {entity.Estado}.");

        entity.Estado = EstadoSolicitudAlmacen.Anulada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    private async Task<SolicitudAlmacen?> LoadAsync(Guid id, bool asTracking, CancellationToken cancellationToken)
    {
        IQueryable<SolicitudAlmacen> query = context.SolicitudesAlmacen
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto);

        if (!asTracking)
            query = query.AsNoTracking();

        return await query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<SolicitudAlmacen> LoadRequiredAsync(Guid id, CancellationToken cancellationToken) =>
        await LoadAsync(id, true, cancellationToken)
            ?? throw new NotFoundException("Solicitud no encontrada.");

    private static void EnsureEstado(SolicitudAlmacen entity, EstadoSolicitudAlmacen expected)
    {
        if (entity.Estado != expected)
            throw new BusinessException($"La solicitud debe estar en estado {expected}.");
    }

    private static SolicitudResponse Map(SolicitudAlmacen e) =>
        new(
            e.Id,
            e.Numero,
            e.FechaSolicitud,
            e.AreaSolicitanteId,
            e.EmpleadoSolicitanteId,
            e.AlmacenId,
            e.Almacen?.Nombre ?? string.Empty,
            e.Estado.ToString(),
            e.Observacion,
            e.Detalles.Select(d => new SolicitudDetalleResponse(
                d.Id,
                d.ProductoId,
                d.Producto?.Codigo ?? string.Empty,
                d.Producto?.Nombre ?? string.Empty,
                d.CantidadSolicitada,
                d.CantidadAprobada,
                d.CantidadEntregada,
                d.Observacion)).ToList());
}
