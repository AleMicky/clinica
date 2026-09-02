using Clinica.Api.Data;
using Clinica.Api.Modules.Compras.SolicitudCompra.Dtos;
using Clinica.Api.Modules.Compras.SolicitudCompra.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using SolicitudCompraDetalleEntity = Clinica.Api.Modules.Compras.SolicitudCompra.Entity.SolicitudCompraDetalle;
using SolicitudCompraEntity = Clinica.Api.Modules.Compras.SolicitudCompra.Entity.SolicitudCompra;
using SolicitudCompraMapper = Clinica.Api.Modules.Compras.SolicitudCompra.Mappers.SolicitudCompraMapper;

namespace Clinica.Api.Modules.Compras.SolicitudCompra.Services;

public interface ISolicitudCompraService
{
    Task<PagedResult<SolicitudCompraResponse>> ListarAsync(
        int? almacenId,
        EstadoSolicitudCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> CrearAsync(
        CreateSolicitudCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> ActualizarAsync(
        int id,
        UpdateSolicitudCompraRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> EnviarAprobacionAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> AprobarAsync(
        int id,
        AprobarSolicitudCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> RechazarAsync(
        int id,
        RechazarSolicitudCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<SolicitudCompraResponse> CancelarAsync(
        int id,
        CancelarSolicitudCompraRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class SolicitudCompraService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    ICorrelativoService correlativoService)
    : ISolicitudCompraService
{
    public async Task<PagedResult<SolicitudCompraResponse>> ListarAsync(
        int? almacenId,
        EstadoSolicitudCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .SolicitudesCompra
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
        }

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim();
            query = query.Where(x =>
                x.Numero.Contains(termino) ||
                (x.Observacion != null && x.Observacion.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var solicitudes = await query
            .OrderByDescending(x => x.FechaSolicitud)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = solicitudes
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<SolicitudCompraResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<SolicitudCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .SolicitudesCompra
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(SolicitudCompraEntity), id);
        }

        return Mapear(
            entity,
            entity.Almacen?.Nombre,
            entity.Detalles);
    }

    public async Task<SolicitudCompraResponse> CrearAsync(
        CreateSolicitudCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La solicitud debe tener al menos un detalle.");
        }

        await ValidarAlmacenAsync(request.AlmacenId, cancellationToken);
        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "SOL",
                Gestion = DateTime.Now.Year,
                Prefijo = "SOL",
                Longitud = 6
            },
            cancellationToken);

        var entity = SolicitudCompraMapper.ToEntity(request);
        entity.Numero = correlativo.NumeroFormateado;
        entity.Observacion = Limpiar(request.Observacion);

        dbContext.SolicitudesCompra.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<SolicitudCompraResponse> ActualizarAsync(
        int id,
        UpdateSolicitudCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La solicitud debe tener al menos un detalle.");
        }

        var entity = await dbContext.SolicitudesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(SolicitudCompraEntity), id);
        }

        if (entity.Estado != EstadoSolicitudCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una solicitud que no esté en estado Borrador.");
        }

        await ValidarAlmacenAsync(request.AlmacenId, cancellationToken);
        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.AlmacenId = request.AlmacenId;
        entity.FechaSolicitud = request.FechaSolicitud;
        entity.FechaRequerida = request.FechaRequerida;
        entity.Observacion = Limpiar(request.Observacion);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.SolicitudesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(SolicitudCompraEntity), id);
        }

        if (entity.Estado != EstadoSolicitudCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una solicitud que no esté en estado Borrador.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<SolicitudCompraResponse> EnviarAprobacionAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoSolicitudCompra.Borrador)
        {
            throw new ConflictException(
                $"No se puede enviar a aprobación una solicitud en estado {entity.Estado}.");
        }

        entity.Estado = EstadoSolicitudCompra.PendienteAprobacion;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<SolicitudCompraResponse> AprobarAsync(
        int id,
        AprobarSolicitudCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraConDetallesAsync(id, cancellationToken);

        if (entity.Estado != EstadoSolicitudCompra.PendienteAprobacion)
        {
            throw new ConflictException(
                $"No se puede aprobar una solicitud en estado {entity.Estado}.");
        }

        entity.Estado = EstadoSolicitudCompra.Aprobada;
        entity.AprobadoPorId = currentUserService.UserName;
        entity.FechaAprobacion = DateTime.UtcNow;
        entity.ObservacionAprobacion = Limpiar(request.ObservacionAprobacion);

        foreach (var detalle in entity.Detalles.Where(x => x.Activo))
        {
            detalle.CantidadAprobada = detalle.CantidadSolicitada;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<SolicitudCompraResponse> RechazarAsync(
        int id,
        RechazarSolicitudCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoSolicitudCompra.PendienteAprobacion)
        {
            throw new ConflictException(
                $"No se puede rechazar una solicitud en estado {entity.Estado}.");
        }

        entity.Estado = EstadoSolicitudCompra.Rechazada;
        entity.AprobadoPorId = currentUserService.UserName;
        entity.FechaAprobacion = DateTime.UtcNow;
        entity.ObservacionAprobacion = request.MotivoRechazo.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<SolicitudCompraResponse> CancelarAsync(
        int id,
        CancelarSolicitudCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado is
            EstadoSolicitudCompra.Atendida or
            EstadoSolicitudCompra.Cancelada)
        {
            throw new ConflictException(
                $"No se puede cancelar una solicitud en estado {entity.Estado}.");
        }

        entity.Estado = EstadoSolicitudCompra.Cancelada;
        entity.Observacion = request.MotivoCancelacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarAlmacenAsync(
        int almacenId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Almacenes
            .AnyAsync(x => x.Id == almacenId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException("Almacen", almacenId);
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<SolicitudCompraDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var productoIds = detalles.Select(x => x.ProductoId).Distinct().ToList();

        var productosActivos = await dbContext.Productos
            .Where(x => productoIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var detalle in detalles)
        {
            if (detalle.CantidadSolicitada <= 0)
            {
                throw new BusinessException(
                    "La cantidad solicitada de cada detalle debe ser mayor que cero.");
            }

            if (!productosActivos.Contains(detalle.ProductoId))
            {
                throw new NotFoundException("Producto", detalle.ProductoId);
            }
        }
    }

    private static SolicitudCompraDetalleEntity CrearDetalle(
        SolicitudCompraDetalleRequest request)
    {
        return new SolicitudCompraDetalleEntity
        {
            ProductoId = request.ProductoId,
            CantidadSolicitada = request.CantidadSolicitada,
            Observacion = Limpiar(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        SolicitudCompraEntity entity,
        IReadOnlyCollection<SolicitudCompraDetalleRequest> detalles)
    {
        foreach (var existing in entity.Detalles.Where(x => x.Activo))
        {
            existing.Activo = false;
        }

        foreach (var detalle in detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }
    }

    private async Task<SolicitudCompraEntity> ObtenerCabeceraAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.SolicitudesCompra
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(SolicitudCompraEntity), id);
        }

        return entity;
    }

    private async Task<SolicitudCompraEntity> ObtenerCabeceraConDetallesAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.SolicitudesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(SolicitudCompraEntity), id);
        }

        return entity;
    }

    private static SolicitudCompraResponse Mapear(
        SolicitudCompraEntity entity,
        string? nombreAlmacen,
        ICollection<SolicitudCompraDetalleEntity>? detalles)
    {
        var response = SolicitudCompraMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(MapearDetalle)
                .ToList()
        };
    }

    private static SolicitudCompraDetalleResponse MapearDetalle(
        SolicitudCompraDetalleEntity entity)
    {
        var response = SolicitudCompraMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            ProductoCodigo = entity.Producto?.Codigo
        };
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
