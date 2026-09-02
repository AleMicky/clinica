using Clinica.Api.Data;
using Clinica.Api.Modules.Compras.OrdenCompra.Dtos;
using Clinica.Api.Modules.Compras.OrdenCompra.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using OrdenCompraDetalleEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompraDetalle;
using OrdenCompraEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompra;
using OrdenCompraMapper = Clinica.Api.Modules.Compras.OrdenCompra.Mappers.OrdenCompraMapper;

namespace Clinica.Api.Modules.Compras.OrdenCompra.Services;

public interface IOrdenCompraService
{
    Task<PagedResult<OrdenCompraResponse>> ListarAsync(
        int? proveedorId,
        int? almacenId,
        EstadoOrdenCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> CrearAsync(
        CreateOrdenCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> ActualizarAsync(
        int id,
        UpdateOrdenCompraRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> EnviarAprobacionAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> AprobarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> EnviarProveedorAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> RecibirAsync(
        int id,
        RecibirOrdenCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<OrdenCompraResponse> CancelarAsync(
        int id,
        CancelarOrdenCompraRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class OrdenCompraService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    ICorrelativoService correlativoService)
    : IOrdenCompraService
{
    private const decimal TasaImpuesto = 0.13m;

    public async Task<PagedResult<OrdenCompraResponse>> ListarAsync(
        int? proveedorId,
        int? almacenId,
        EstadoOrdenCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .OrdenesCompra
            .AsNoTracking()
            .Where(x => x.Activo);

        if (proveedorId.HasValue)
        {
            query = query.Where(x => x.ProveedorId == proveedorId.Value);
        }

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

        var ordenes = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Proveedor)
            .Include(x => x.Almacen)
            .Include(x => x.SolicitudCompra)
            .Include(x => x.CotizacionCompra)
            .ToListAsync(cancellationToken);

        var items = ordenes
            .Select(x => Mapear(
                x,
                x.Proveedor?.RazonSocial,
                x.Almacen?.Nombre,
                x.SolicitudCompra?.Numero,
                x.CotizacionCompra?.Numero,
                detalles: null))
            .ToList();

        return new PagedResult<OrdenCompraResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<OrdenCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .OrdenesCompra
            .AsNoTracking()
            .Include(x => x.Proveedor)
            .Include(x => x.Almacen)
            .Include(x => x.SolicitudCompra)
            .Include(x => x.CotizacionCompra)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(OrdenCompraEntity), id);
        }

        return Mapear(
            entity,
            entity.Proveedor?.RazonSocial,
            entity.Almacen?.Nombre,
            entity.SolicitudCompra?.Numero,
            entity.CotizacionCompra?.Numero,
            entity.Detalles);
    }

    public async Task<OrdenCompraResponse> CrearAsync(
        CreateOrdenCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La orden de compra debe tener al menos un detalle.");
        }

        await ValidarProveedorAsync(request.ProveedorId, cancellationToken);
        await ValidarAlmacenAsync(request.AlmacenId, cancellationToken);

        if (request.SolicitudCompraId.HasValue)
        {
            await ValidarSolicitudCompraAsync(request.SolicitudCompraId.Value, cancellationToken);
        }

        if (request.CotizacionCompraId.HasValue)
        {
            await ValidarCotizacionCompraAsync(request.CotizacionCompraId.Value, cancellationToken);
        }

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "OC",
                Gestion = DateTime.Now.Year,
                Prefijo = "OC",
                Longitud = 6
            },
            cancellationToken);

        var entity = OrdenCompraMapper.ToEntity(request);
        entity.Numero = correlativo.NumeroFormateado;
        entity.Observacion = Limpiar(request.Observacion);
        entity.CondicionPago = Limpiar(request.CondicionPago);

        dbContext.OrdenesCompra.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        RecalcularTotales(entity);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<OrdenCompraResponse> ActualizarAsync(
        int id,
        UpdateOrdenCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La orden de compra debe tener al menos un detalle.");
        }

        var entity = await dbContext.OrdenesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(OrdenCompraEntity), id);
        }

        if (entity.Estado != EstadoOrdenCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una orden de compra que no esté en estado Borrador.");
        }

        await ValidarProveedorAsync(request.ProveedorId, cancellationToken);
        await ValidarAlmacenAsync(request.AlmacenId, cancellationToken);

        if (request.SolicitudCompraId.HasValue)
        {
            await ValidarSolicitudCompraAsync(request.SolicitudCompraId.Value, cancellationToken);
        }

        if (request.CotizacionCompraId.HasValue)
        {
            await ValidarCotizacionCompraAsync(request.CotizacionCompraId.Value, cancellationToken);
        }

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.ProveedorId = request.ProveedorId;
        entity.AlmacenId = request.AlmacenId;
        entity.SolicitudCompraId = request.SolicitudCompraId;
        entity.CotizacionCompraId = request.CotizacionCompraId;
        entity.Fecha = request.Fecha;
        entity.FechaEntregaEsperada = request.FechaEntregaEsperada;
        entity.CondicionPago = Limpiar(request.CondicionPago);
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
        var entity = await dbContext.OrdenesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(OrdenCompraEntity), id);
        }

        if (entity.Estado != EstadoOrdenCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una orden de compra que no esté en estado Borrador.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<OrdenCompraResponse> EnviarAprobacionAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoOrdenCompra.Borrador)
        {
            throw new ConflictException(
                $"No se puede enviar a aprobación una orden en estado {entity.Estado}.");
        }

        entity.Estado = EstadoOrdenCompra.PendienteAprobacion;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<OrdenCompraResponse> AprobarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoOrdenCompra.PendienteAprobacion)
        {
            throw new ConflictException(
                $"No se puede aprobar una orden en estado {entity.Estado}.");
        }

        entity.Estado = EstadoOrdenCompra.Aprobada;
        entity.AprobadoPorId = currentUserService.UserName;
        entity.FechaAprobacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<OrdenCompraResponse> EnviarProveedorAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoOrdenCompra.Aprobada)
        {
            throw new ConflictException(
                $"No se puede enviar al proveedor una orden en estado {entity.Estado}.");
        }

        entity.Estado = EstadoOrdenCompra.EnviadaProveedor;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<OrdenCompraResponse> RecibirAsync(
        int id,
        RecibirOrdenCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("Debe indicar al menos un detalle recibido.");
        }

        var entity = await ObtenerCabeceraConDetallesAsync(id, cancellationToken);

        if (entity.Estado is not
            (EstadoOrdenCompra.EnviadaProveedor or
             EstadoOrdenCompra.ParcialmenteRecibida))
        {
            throw new ConflictException(
                $"No se puede recibir una orden en estado {entity.Estado}.");
        }

        AplicarRecepcion(entity, request.Detalles);

        entity.Estado = EsRecepcionCompleta(entity)
            ? EstadoOrdenCompra.Recibida
            : EstadoOrdenCompra.ParcialmenteRecibida;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<OrdenCompraResponse> CancelarAsync(
        int id,
        CancelarOrdenCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado is
            EstadoOrdenCompra.Recibida or
            EstadoOrdenCompra.Cancelada)
        {
            throw new ConflictException(
                $"No se puede cancelar una orden en estado {entity.Estado}.");
        }

        entity.Estado = EstadoOrdenCompra.Cancelada;
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

    private async Task ValidarCotizacionCompraAsync(
        int cotizacionCompraId,
        CancellationToken cancellationToken)
    {
        var existe = await dbContext.CotizacionesCompra
            .AnyAsync(x => x.Id == cotizacionCompraId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException("CotizacionCompra", cotizacionCompraId);
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<OrdenCompraDetalleRequest> detalles,
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

    private static OrdenCompraDetalleEntity CrearDetalle(
        OrdenCompraDetalleRequest request)
    {
        return new OrdenCompraDetalleEntity
        {
            ProductoId = request.ProductoId,
            Cantidad = request.Cantidad,
            PrecioUnitario = request.PrecioUnitario,
            Descuento = request.Descuento,
            Observacion = Limpiar(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        OrdenCompraEntity entity,
        IReadOnlyCollection<OrdenCompraDetalleRequest> detalles)
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

    private static void RecalcularTotales(OrdenCompraEntity entity)
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

    private static void AplicarRecepcion(
        OrdenCompraEntity entity,
        IReadOnlyCollection<RecibirOrdenCompraDetalleRequest> cantidades)
    {
        var porId = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(x => x.Id);

        var vistos = new HashSet<int>();

        foreach (var item in cantidades)
        {
            if (item.CantidadRecibida <= 0)
            {
                throw new BusinessException(
                    "La cantidad recibida de cada detalle debe ser mayor que cero.");
            }

            if (!porId.TryGetValue(item.DetalleId, out var detalle))
            {
                throw new NotFoundException(
                    nameof(OrdenCompraDetalleEntity),
                    item.DetalleId);
            }

            vistos.Add(item.DetalleId);

            var nuevaRecibida = detalle.CantidadRecibida + item.CantidadRecibida;

            if (nuevaRecibida > detalle.Cantidad)
            {
                throw new BusinessException(
                    $"La cantidad recibida del detalle '{item.DetalleId}' supera la cantidad ordenada.");
            }

            detalle.CantidadRecibida = nuevaRecibida;
        }

        foreach (var detalle in entity.Detalles.Where(x => x.Activo && !vistos.Contains(x.Id)))
        {
            detalle.CantidadRecibida = 0;
        }
    }

    private static bool EsRecepcionCompleta(OrdenCompraEntity entity)
    {
        return entity.Detalles
            .Where(x => x.Activo)
            .All(x => x.CantidadRecibida >= x.Cantidad);
    }

    private async Task<OrdenCompraEntity> ObtenerCabeceraAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.OrdenesCompra
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(OrdenCompraEntity), id);
        }

        return entity;
    }

    private async Task<OrdenCompraEntity> ObtenerCabeceraConDetallesAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.OrdenesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(OrdenCompraEntity), id);
        }

        return entity;
    }

    private static OrdenCompraResponse Mapear(
        OrdenCompraEntity entity,
        string? proveedorRazonSocial,
        string? almacenNombre,
        string? solicitudCompraNumero,
        string? cotizacionCompraNumero,
        ICollection<OrdenCompraDetalleEntity>? detalles)
    {
        var response = OrdenCompraMapper.ToResponse(entity);
        return response with
        {
            ProveedorRazonSocial = proveedorRazonSocial,
            AlmacenNombre = almacenNombre,
            SolicitudCompraNumero = solicitudCompraNumero,
            CotizacionCompraNumero = cotizacionCompraNumero,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(MapearDetalle)
                .ToList()
        };
    }

    private static OrdenCompraDetalleResponse MapearDetalle(
        OrdenCompraDetalleEntity entity)
    {
        var response = OrdenCompraMapper.ToResponse(entity);
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
