using Clinica.Api.Data;
using Clinica.Api.Modules.Compras.CotizacionCompra.Dtos;
using Clinica.Api.Modules.Compras.CotizacionCompra.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using CotizacionCompraDetalleEntity = Clinica.Api.Modules.Compras.CotizacionCompra.Entity.CotizacionCompraDetalle;
using CotizacionCompraEntity = Clinica.Api.Modules.Compras.CotizacionCompra.Entity.CotizacionCompra;
using CotizacionCompraMapper = Clinica.Api.Modules.Compras.CotizacionCompra.Mappers.CotizacionCompraMapper;

namespace Clinica.Api.Modules.Compras.CotizacionCompra.Services;

public interface ICotizacionCompraService
{
    Task<PagedResult<CotizacionCompraResponse>> ListarAsync(
        int? proveedorId,
        int? solicitudCompraId,
        EstadoCotizacionCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> CrearAsync(
        CreateCotizacionCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> ActualizarAsync(
        int id,
        UpdateCotizacionCompraRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> RecibirAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> SeleccionarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> RechazarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CotizacionCompraResponse> CancelarAsync(
        int id,
        CancelarCotizacionCompraRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class CotizacionCompraService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    ICorrelativoService correlativoService)
    : ICotizacionCompraService
{
    private const decimal TasaImpuesto = 0.13m;

    public async Task<PagedResult<CotizacionCompraResponse>> ListarAsync(
        int? proveedorId,
        int? solicitudCompraId,
        EstadoCotizacionCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .CotizacionesCompra
            .AsNoTracking()
            .Where(x => x.Activo);

        if (proveedorId.HasValue)
        {
            query = query.Where(x => x.ProveedorId == proveedorId.Value);
        }

        if (solicitudCompraId.HasValue)
        {
            query = query.Where(x => x.SolicitudCompraId == solicitudCompraId.Value);
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

        var cotizaciones = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Proveedor)
            .Include(x => x.SolicitudCompra)
            .ToListAsync(cancellationToken);

        var items = cotizaciones
            .Select(x => Mapear(
                x,
                x.Proveedor?.RazonSocial,
                x.SolicitudCompra?.Numero,
                detalles: null))
            .ToList();

        return new PagedResult<CotizacionCompraResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<CotizacionCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .CotizacionesCompra
            .AsNoTracking()
            .Include(x => x.Proveedor)
            .Include(x => x.SolicitudCompra)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(CotizacionCompraEntity), id);
        }

        return Mapear(
            entity,
            entity.Proveedor?.RazonSocial,
            entity.SolicitudCompra?.Numero,
            entity.Detalles);
    }

    public async Task<CotizacionCompraResponse> CrearAsync(
        CreateCotizacionCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La cotización debe tener al menos un detalle.");
        }

        await ValidarProveedorAsync(request.ProveedorId, cancellationToken);

        if (request.SolicitudCompraId.HasValue)
        {
            await ValidarSolicitudCompraAsync(request.SolicitudCompraId.Value, cancellationToken);
        }

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "COT",
                Gestion = DateTime.Now.Year,
                Prefijo = "COT",
                Longitud = 6
            },
            cancellationToken);

        var entity = CotizacionCompraMapper.ToEntity(request);
        entity.Numero = correlativo.NumeroFormateado;
        entity.Observacion = Limpiar(request.Observacion);
        entity.CondicionPago = Limpiar(request.CondicionPago);
        entity.TiempoEntrega = Limpiar(request.TiempoEntrega);

        dbContext.CotizacionesCompra.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        RecalcularTotales(entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<CotizacionCompraResponse> ActualizarAsync(
        int id,
        UpdateCotizacionCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La cotización debe tener al menos un detalle.");
        }

        var entity = await dbContext.CotizacionesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(CotizacionCompraEntity), id);
        }

        if (entity.Estado != EstadoCotizacionCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una cotización que no esté en estado Borrador.");
        }

        await ValidarProveedorAsync(request.ProveedorId, cancellationToken);

        if (request.SolicitudCompraId.HasValue)
        {
            await ValidarSolicitudCompraAsync(request.SolicitudCompraId.Value, cancellationToken);
        }

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.ProveedorId = request.ProveedorId;
        entity.SolicitudCompraId = request.SolicitudCompraId;
        entity.Fecha = request.Fecha;
        entity.FechaVencimiento = request.FechaVencimiento;
        entity.CondicionPago = Limpiar(request.CondicionPago);
        entity.TiempoEntrega = Limpiar(request.TiempoEntrega);
        entity.Observacion = Limpiar(request.Observacion);

        ReemplazarDetalles(entity, request.Detalles);
        RecalcularTotales(entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.CotizacionesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(CotizacionCompraEntity), id);
        }

        if (entity.Estado != EstadoCotizacionCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una cotización que no esté en estado Borrador.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<CotizacionCompraResponse> RecibirAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoCotizacionCompra.Borrador)
        {
            throw new ConflictException(
                $"No se puede recibir una cotización en estado {entity.Estado}.");
        }

        entity.Estado = EstadoCotizacionCompra.Recibida;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<CotizacionCompraResponse> SeleccionarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoCotizacionCompra.Recibida)
        {
            throw new ConflictException(
                $"No se puede seleccionar una cotización en estado {entity.Estado}.");
        }

        entity.Estado = EstadoCotizacionCompra.Seleccionada;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<CotizacionCompraResponse> RechazarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoCotizacionCompra.Recibida)
        {
            throw new ConflictException(
                $"No se puede rechazar una cotización en estado {entity.Estado}.");
        }

        entity.Estado = EstadoCotizacionCompra.Rechazada;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<CotizacionCompraResponse> CancelarAsync(
        int id,
        CancelarCotizacionCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado is
            EstadoCotizacionCompra.Seleccionada or
            EstadoCotizacionCompra.Cancelada)
        {
            throw new ConflictException(
                $"No se puede cancelar una cotización en estado {entity.Estado}.");
        }

        entity.Estado = EstadoCotizacionCompra.Cancelada;
        entity.Observacion = request.MotivoCancelacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarProveedorAsync(
        int proveedorId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.Proveedores
            .AnyAsync(x => x.Id == proveedorId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException("Proveedor", proveedorId);
        }
    }

    private async Task ValidarSolicitudCompraAsync(
        int solicitudCompraId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.SolicitudesCompra
            .AnyAsync(x => x.Id == solicitudCompraId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException("SolicitudCompra", solicitudCompraId);
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<CotizacionCompraDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var productoIds = detalles.Select(x => x.ProductoId).Distinct().ToList();

        var productosActivos = await dbContext.Productos
            .Where(x => productoIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        foreach (var detalle in detalles)
        {
            if (detalle.Cantidad <= 0)
            {
                throw new BusinessException(
                    "La cantidad de cada detalle debe ser mayor que cero.");
            }

            if (detalle.PrecioUnitario < 0)
            {
                throw new BusinessException(
                    "El precio unitario de cada detalle no puede ser negativo.");
            }

            if (!productosActivos.Contains(detalle.ProductoId))
            {
                throw new NotFoundException("Producto", detalle.ProductoId);
            }
        }
    }

    private static CotizacionCompraDetalleEntity CrearDetalle(
        CotizacionCompraDetalleRequest request)
    {
        return new CotizacionCompraDetalleEntity
        {
            ProductoId = request.ProductoId,
            Cantidad = request.Cantidad,
            PrecioUnitario = request.PrecioUnitario,
            Descuento = request.Descuento,
            Observacion = Limpiar(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        CotizacionCompraEntity entity,
        IReadOnlyCollection<CotizacionCompraDetalleRequest> detalles)
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

    private static void RecalcularTotales(CotizacionCompraEntity entity)
    {
        var detallesActivos = entity.Detalles.Where(x => x.Activo).ToList();

        foreach (var detalle in detallesActivos)
        {
            var descuentoLinea = detalle.Cantidad * detalle.PrecioUnitario * (detalle.Descuento / 100m);
            detalle.Subtotal = (detalle.Cantidad * detalle.PrecioUnitario) - descuentoLinea;
        }

        entity.Subtotal = detallesActivos.Sum(x => x.Subtotal);
        entity.Descuento = detallesActivos.Sum(x =>
            x.Cantidad * x.PrecioUnitario * (x.Descuento / 100m));
        entity.Impuesto = entity.Subtotal * TasaImpuesto;
        entity.Total = entity.Subtotal + entity.Impuesto;
    }

    private async Task<CotizacionCompraEntity> ObtenerCabeceraAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.CotizacionesCompra
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(CotizacionCompraEntity), id);
        }

        return entity;
    }

    private static CotizacionCompraResponse Mapear(
        CotizacionCompraEntity entity,
        string? proveedorRazonSocial,
        string? solicitudCompraNumero,
        ICollection<CotizacionCompraDetalleEntity>? detalles)
    {
        var response = CotizacionCompraMapper.ToResponse(entity);
        return response with
        {
            ProveedorRazonSocial = proveedorRazonSocial,
            SolicitudCompraNumero = solicitudCompraNumero,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(MapearDetalle)
                .ToList()
        };
    }

    private static CotizacionCompraDetalleResponse MapearDetalle(
        CotizacionCompraDetalleEntity entity)
    {
        var response = CotizacionCompraMapper.ToResponse(entity);
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
