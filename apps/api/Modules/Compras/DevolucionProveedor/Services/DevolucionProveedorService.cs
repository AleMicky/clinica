using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Dtos;
using Clinica.Api.Modules.Compras.DevolucionProveedor.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using DevolucionProveedorDetalleEntity = Clinica.Api.Modules.Compras.DevolucionProveedor.Entity.DevolucionProveedorDetalle;
using DevolucionProveedorEntity = Clinica.Api.Modules.Compras.DevolucionProveedor.Entity.DevolucionProveedor;
using DevolucionProveedorMapper = Clinica.Api.Modules.Compras.DevolucionProveedor.Mappers.DevolucionProveedorMapper;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using RecepcionCompraEntity = Clinica.Api.Modules.Compras.RecepcionCompra.Entity.RecepcionCompra;

namespace Clinica.Api.Modules.Compras.DevolucionProveedor.Services;

public interface IDevolucionProveedorService
{
    Task<PagedResult<DevolucionProveedorResponse>> ListarAsync(
        int? proveedorId,
        int? almacenId,
        int? recepcionCompraId,
        EstadoDevolucionProveedor? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> CrearAsync(
        CreateDevolucionProveedorRequest request,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> ActualizarAsync(
        int id,
        UpdateDevolucionProveedorRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> EnviarAprobacionAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> AprobarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> RechazarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DevolucionProveedorResponse> AnularAsync(
        int id,
        AnularDevolucionProveedorRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class DevolucionProveedorService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    ICorrelativoService correlativoService,
    IMovimientoInventarioService movimientoInventarioService)
    : IDevolucionProveedorService
{
    public async Task<PagedResult<DevolucionProveedorResponse>> ListarAsync(
        int? proveedorId,
        int? almacenId,
        int? recepcionCompraId,
        EstadoDevolucionProveedor? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .DevolucionesProveedor
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

        if (recepcionCompraId.HasValue)
        {
            query = query.Where(x => x.RecepcionCompraId == recepcionCompraId.Value);
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
                x.Motivo.Contains(termino) ||
                (x.Observacion != null && x.Observacion.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var devoluciones = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Proveedor)
            .Include(x => x.Almacen)
            .Include(x => x.RecepcionCompra)
            .ToListAsync(cancellationToken);

        var items = devoluciones
            .Select(x => Mapear(
                x,
                x.Proveedor?.RazonSocial,
                x.Almacen?.Nombre,
                x.RecepcionCompra?.Numero,
                detalles: null))
            .ToList();

        return new PagedResult<DevolucionProveedorResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<DevolucionProveedorResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var devolucion = await dbContext
            .DevolucionesProveedor
            .AsNoTracking()
            .Include(x => x.Proveedor)
            .Include(x => x.Almacen)
            .Include(x => x.RecepcionCompra)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (devolucion is null || !devolucion.Activo)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        return Mapear(
            devolucion,
            devolucion.Proveedor?.RazonSocial,
            devolucion.Almacen?.Nombre,
            devolucion.RecepcionCompra?.Numero,
            devolucion.Detalles);
    }

    public async Task<DevolucionProveedorResponse> CrearAsync(
        CreateDevolucionProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La devolución debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.ProveedorId,
            request.AlmacenId,
            request.RecepcionCompraId,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "DEV",
            Gestion = request.Fecha.Year,
            Prefijo = "DEV",
            Longitud = 6
        }, cancellationToken);

        var entity = DevolucionProveedorMapper.ToEntity(request);
        entity.Numero = correlativo.NumeroFormateado;
        entity.Motivo = request.Motivo.Trim();
        entity.Observacion = Limpiar(request.Observacion);

        dbContext.DevolucionesProveedor.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<DevolucionProveedorResponse> ActualizarAsync(
        int id,
        UpdateDevolucionProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La devolución debe tener al menos un detalle.");
        }

        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        if (entity.Estado != EstadoDevolucionProveedor.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una devolución que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.ProveedorId,
            request.AlmacenId,
            request.RecepcionCompraId,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.ProveedorId = request.ProveedorId;
        entity.AlmacenId = request.AlmacenId;
        entity.RecepcionCompraId = request.RecepcionCompraId;
        entity.Fecha = request.Fecha;
        entity.Motivo = request.Motivo.Trim();
        entity.Observacion = Limpiar(request.Observacion);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        if (entity.Estado != EstadoDevolucionProveedor.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una devolución que no esté en estado Borrador. Anúlala en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<DevolucionProveedorResponse> EnviarAprobacionAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        if (entity.Estado != EstadoDevolucionProveedor.Borrador)
        {
            throw new ConflictException(
                $"No se puede enviar a aprobación una devolución en estado {entity.Estado}.");
        }

        entity.Estado = EstadoDevolucionProveedor.PendienteAprobacion;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<DevolucionProveedorResponse> AprobarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        if (entity.Estado != EstadoDevolucionProveedor.PendienteAprobacion)
        {
            throw new ConflictException(
                $"No se puede aprobar una devolución en estado {entity.Estado}.");
        }

        entity.Estado = EstadoDevolucionProveedor.Aprobada;
        entity.AutorizadoPorId = currentUserService.UserName;
        entity.FechaAutorizacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<DevolucionProveedorResponse> RechazarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        if (entity.Estado != EstadoDevolucionProveedor.PendienteAprobacion)
        {
            throw new ConflictException(
                $"No se puede rechazar una devolución en estado {entity.Estado}.");
        }

        entity.Estado = EstadoDevolucionProveedor.Rechazada;
        entity.AutorizadoPorId = currentUserService.UserName;
        entity.FechaAutorizacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<DevolucionProveedorResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        switch (entity.Estado)
        {
            case EstadoDevolucionProveedor.Confirmada:
                throw new ConflictException("La devolución ya está confirmada.");
            case EstadoDevolucionProveedor.Anulada:
                throw new ConflictException("No se puede confirmar una devolución anulada.");
            case EstadoDevolucionProveedor.Aprobada:
                break;
            default:
                throw new ConflictException(
                    "Para confirmar, la devolución debe estar Aprobada.");
        }

        var detallesActivos = entity.Detalles.Where(x => x.Activo).ToList();

        if (detallesActivos.Count == 0)
        {
            throw new BusinessException("La devolución no tiene detalles activos.");
        }

        var detallesMovimiento = detallesActivos
            .Select(d => new MovimientoInventarioDetalleRequest
            {
                ProductoId = d.ProductoId,
                LoteId = d.LoteId,
                Cantidad = d.Cantidad
            })
            .ToList();

        var requestIntegracion = new MovimientoInventarioIntegracionRequest
        {
            TipoMovimiento = "DEVOLUCION_PROVEEDOR",
            AlmacenId = entity.AlmacenId,
            Fecha = DateTime.UtcNow,
            TipoReferencia = "DEVOLUCION_PROVEEDOR",
            ReferenciaId = entity.Id,
            Observacion = $"Devolución a proveedor - Ref: {entity.Numero}",
            Detalles = detallesMovimiento
        };

        await movimientoInventarioService.CrearIntegracionAsync(
            requestIntegracion,
            true,
            cancellationToken);

        entity.Estado = EstadoDevolucionProveedor.Confirmada;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<DevolucionProveedorResponse> AnularAsync(
        int id,
        AnularDevolucionProveedorRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.DevolucionesProveedor
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(DevolucionProveedorEntity), id);
        }

        if (entity.Estado == EstadoDevolucionProveedor.Anulada)
        {
            throw new ConflictException("La devolución ya está anulada.");
        }

        if (entity.Estado == EstadoDevolucionProveedor.Borrador)
        {
            throw new ConflictException(
                "Una devolución en estado Borrador debe eliminarse en lugar de anularse.");
        }

        entity.Estado = EstadoDevolucionProveedor.Anulada;
        entity.Observacion = Limpiar(request.MotivoAnulacion) ?? entity.Observacion;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarEncabezadoAsync(
        int proveedorId,
        int almacenId,
        int? recepcionCompraId,
        CancellationToken cancellationToken)
    {
        var existeProveedor = await dbContext.Proveedores
            .AnyAsync(x => x.Id == proveedorId && x.Activo, cancellationToken);

        if (!existeProveedor)
        {
            throw new NotFoundException(nameof(ProveedorEntity), proveedorId);
        }

        var existeAlmacen = await dbContext.Almacenes
            .AnyAsync(x => x.Id == almacenId && x.Activo, cancellationToken);

        if (!existeAlmacen)
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenId);
        }

        if (recepcionCompraId.HasValue)
        {
            var existeRecepcion = await dbContext.RecepcionesCompra
                .AnyAsync(
                    x => x.Id == recepcionCompraId.Value && x.Activo,
                    cancellationToken);

            if (!existeRecepcion)
            {
                throw new NotFoundException(
                    nameof(RecepcionCompraEntity),
                    recepcionCompraId.Value);
            }
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<DevolucionProveedorDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var productoIds = detalles.Select(x => x.ProductoId).Distinct().ToList();
        var loteIds = detalles
            .Where(x => x.LoteId.HasValue)
            .Select(x => x.LoteId!.Value)
            .Distinct()
            .ToList();

        var productosActivos = await dbContext.Productos
            .Where(x => productoIds.Contains(x.Id) && x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var loteIdsValidos = new HashSet<int>();
        if (loteIds.Count > 0)
        {
            loteIdsValidos = (await dbContext.Lotes
                    .Where(x => loteIds.Contains(x.Id) && x.Activo)
                    .Select(x => x.Id)
                    .ToListAsync(cancellationToken))
                .ToHashSet();
        }

        foreach (var detalle in detalles)
        {
            if (detalle.Cantidad <= 0)
            {
                throw new BusinessException(
                    "La cantidad de cada detalle debe ser mayor que cero.");
            }

            if (!productosActivos.Contains(detalle.ProductoId))
            {
                throw new NotFoundException(nameof(ProductoEntity), detalle.ProductoId);
            }

            if (detalle.LoteId.HasValue &&
                !loteIdsValidos.Contains(detalle.LoteId.Value))
            {
                throw new NotFoundException(nameof(LoteEntity), detalle.LoteId.Value);
            }
        }
    }

    private static DevolucionProveedorDetalleEntity CrearDetalle(
        DevolucionProveedorDetalleRequest request)
    {
        return new DevolucionProveedorDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            Cantidad = request.Cantidad,
            Motivo = Limpiar(request.Motivo),
            Observacion = Limpiar(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        DevolucionProveedorEntity entity,
        IReadOnlyCollection<DevolucionProveedorDetalleRequest> detalles)
    {
        var incoming = detalles.ToList();

        foreach (var existing in entity.Detalles.Where(x => x.Activo))
        {
            existing.Activo = false;
        }

        foreach (var detalle in incoming)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }
    }

    private static DevolucionProveedorResponse Mapear(
        DevolucionProveedorEntity entity,
        string? razonSocialProveedor,
        string? nombreAlmacen,
        string? numeroRecepcion,
        ICollection<DevolucionProveedorDetalleEntity>? detalles)
    {
        var response = DevolucionProveedorMapper.ToResponse(entity);

        return response with
        {
            ProveedorRazonSocial = razonSocialProveedor,
            AlmacenNombre = nombreAlmacen,
            RecepcionCompraNumero = numeroRecepcion,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(x => MapearDetalle(x))
                .ToList()
        };
    }

    private static DevolucionProveedorDetalleResponse MapearDetalle(
        DevolucionProveedorDetalleEntity entity)
    {
        var response = DevolucionProveedorMapper.ToResponse(entity);

        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            ProductoCodigo = entity.Producto?.Codigo,
            LoteNumero = entity.Lote?.NumeroLote
        };
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}