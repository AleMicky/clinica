using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Dtos;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Modules.Compras.RecepcionCompra.Dtos;
using Clinica.Api.Modules.Compras.RecepcionCompra.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using OrdenCompraDetalleEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompraDetalle;
using OrdenCompraEntity = Clinica.Api.Modules.Compras.OrdenCompra.Entity.OrdenCompra;
using ProveedorEntity = Clinica.Api.Modules.Compras.Proveedor.Entity.Proveedor;
using RecepcionCompraDetalleEntity = Clinica.Api.Modules.Compras.RecepcionCompra.Entity.RecepcionCompraDetalle;
using RecepcionCompraEntity = Clinica.Api.Modules.Compras.RecepcionCompra.Entity.RecepcionCompra;
using RecepcionCompraMapper = Clinica.Api.Modules.Compras.RecepcionCompra.Mappers.RecepcionCompraMapper;

namespace Clinica.Api.Modules.Compras.RecepcionCompra.Services;

public interface IRecepcionCompraService
{
    Task<PagedResult<RecepcionCompraResponse>> ListarAsync(
        int? ordenCompraId,
        int? proveedorId,
        int? almacenId,
        EstadoRecepcionCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<RecepcionCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<RecepcionCompraResponse> CrearAsync(
        CreateRecepcionCompraRequest request,
        CancellationToken cancellationToken = default);

    Task<RecepcionCompraResponse> ActualizarAsync(
        int id,
        UpdateRecepcionCompraRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<RecepcionCompraResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<RecepcionCompraResponse> AnularAsync(
        int id,
        AnularRecepcionCompraRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class RecepcionCompraService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    ICorrelativoService correlativoService,
    IMovimientoInventarioService movimientoInventarioService)
    : IRecepcionCompraService
{
    public async Task<PagedResult<RecepcionCompraResponse>> ListarAsync(
        int? ordenCompraId,
        int? proveedorId,
        int? almacenId,
        EstadoRecepcionCompra? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .RecepcionesCompra
            .AsNoTracking()
            .Where(x => x.Activo);

        if (ordenCompraId.HasValue)
        {
            query = query.Where(x => x.OrdenCompraId == ordenCompraId.Value);
        }

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
                (x.NumeroFactura != null && x.NumeroFactura.Contains(termino)) ||
                (x.Observacion != null && x.Observacion.Contains(termino)));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var page = pagination.ValidPage;
        var pageSize = pagination.ValidPageSize;

        var recepciones = await query
            .OrderByDescending(x => x.FechaRecepcion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.OrdenCompra)
            .Include(x => x.Proveedor)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = recepciones
            .Select(x => Mapear(
                x,
                x.OrdenCompra?.Numero,
                x.Proveedor?.RazonSocial,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<RecepcionCompraResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<RecepcionCompraResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .RecepcionesCompra
            .AsNoTracking()
            .Include(x => x.OrdenCompra)
            .Include(x => x.Proveedor)
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(RecepcionCompraEntity), id);
        }

        return Mapear(
            entity,
            entity.OrdenCompra?.Numero,
            entity.Proveedor?.RazonSocial,
            entity.Almacen?.Nombre,
            entity.Detalles);
    }

    public async Task<RecepcionCompraResponse> CrearAsync(
        CreateRecepcionCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La recepción debe tener al menos un detalle.");
        }

        var ordenCompra = await ValidarOrdenCompraAsync(
            request.OrdenCompraId,
            request.AlmacenId,
            cancellationToken);

        await ValidarDetallesAsync(
            request.OrdenCompraId,
            request.Detalles,
            cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest
            {
                Codigo = "REC",
                Gestion = DateTime.Now.Year,
                Prefijo = "REC",
                Longitud = 6
            },
            cancellationToken);

        var entity = RecepcionCompraMapper.ToEntity(request);
        entity.Numero = correlativo.NumeroFormateado;
        entity.ProveedorId = ordenCompra.ProveedorId;
        entity.Observacion = Limpiar(request.Observacion);
        entity.NumeroFactura = Limpiar(request.NumeroFactura);
        entity.NumeroRemision = Limpiar(request.NumeroRemision);

        dbContext.RecepcionesCompra.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(
                detalle,
                ordenCompra.Detalles.First(d => d.Id == detalle.OrdenCompraDetalleId)));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<RecepcionCompraResponse> ActualizarAsync(
        int id,
        UpdateRecepcionCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La recepción debe tener al menos un detalle.");
        }

        var entity = await dbContext.RecepcionesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(RecepcionCompraEntity), id);
        }

        if (entity.Estado != EstadoRecepcionCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una recepción que no esté en estado Borrador.");
        }

        var ordenCompra = await ValidarOrdenCompraAsync(
            request.OrdenCompraId,
            request.AlmacenId,
            cancellationToken);

        await ValidarDetallesAsync(
            request.OrdenCompraId,
            request.Detalles,
            cancellationToken);

        entity.OrdenCompraId = request.OrdenCompraId;
        entity.ProveedorId = ordenCompra.ProveedorId;
        entity.AlmacenId = request.AlmacenId;
        entity.FechaRecepcion = request.FechaRecepcion;
        entity.NumeroFactura = Limpiar(request.NumeroFactura);
        entity.NumeroRemision = Limpiar(request.NumeroRemision);
        entity.Observacion = Limpiar(request.Observacion);

        ReemplazarDetalles(
            entity,
            request.Detalles,
            ordenCompra.Detalles.ToList());

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.RecepcionesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(RecepcionCompraEntity), id);
        }

        if (entity.Estado != EstadoRecepcionCompra.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una recepción que no esté en estado Borrador.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<RecepcionCompraResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraConDetallesAsync(id, cancellationToken);

        if (entity.Estado != EstadoRecepcionCompra.Borrador)
        {
            throw new ConflictException(
                $"No se puede confirmar una recepción en estado {entity.Estado}.");
        }

        var detallesActivos = entity.Detalles
            .Where(x => x.Activo && x.CantidadRecibida > 0)
            .ToList();

        if (detallesActivos.Count == 0)
        {
            throw new BusinessException("La recepción debe tener al menos un detalle con cantidad.");
        }

        var detallesMovimiento = detallesActivos
            .Select(x => new MovimientoInventarioDetalleRequest
            {
                ProductoId = x.ProductoId,
                LoteId = x.LoteId,
                Cantidad = x.CantidadRecibida,
                CostoUnitario = x.PrecioUnitario
            })
            .ToList();

        var requestIntegracion = new MovimientoInventarioIntegracionRequest
        {
            TipoMovimiento = "RECEPCION_COMPRA",
            AlmacenId = entity.AlmacenId,
            Fecha = DateTime.UtcNow,
            TipoReferencia = "RECEPCION_COMPRA",
            ReferenciaId = entity.Id,
            Observacion = $"Recepción de compra {entity.Numero}",
            Detalles = detallesMovimiento
        };

        await movimientoInventarioService.CrearIntegracionAsync(
            requestIntegracion,
            confirmar: true,
            cancellationToken);

        ActualizarOrdenCompra(entity, detallesActivos, cancellationToken);

        entity.Estado = EstadoRecepcionCompra.Confirmada;
        entity.RecibidoPorId = currentUserService.UserName;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<RecepcionCompraResponse> AnularAsync(
        int id,
        AnularRecepcionCompraRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoRecepcionCompra.Confirmada)
        {
            throw new ConflictException(
                $"No se puede anular una recepción en estado {entity.Estado}.");
        }

        entity.Estado = EstadoRecepcionCompra.Anulada;
        entity.Observacion = request.MotivoAnulacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task<OrdenCompraEntity> ValidarOrdenCompraAsync(
        int ordenCompraId,
        int almacenId,
        CancellationToken cancellationToken)
    {
        var ordenCompra = await dbContext.OrdenesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(
                x => x.Id == ordenCompraId && x.Activo,
                cancellationToken);

        if (ordenCompra is null)
        {
            throw new NotFoundException(nameof(OrdenCompraEntity), ordenCompraId);
        }

        var existeAlmacen = await dbContext.Almacenes
            .AnyAsync(x => x.Id == almacenId && x.Activo, cancellationToken);

        if (!existeAlmacen)
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenId);
        }

        return ordenCompra;
    }

    private async Task ValidarDetallesAsync(
        int ordenCompraId,
        IReadOnlyCollection<RecepcionCompraDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var ordenDetalleIds = detalles.Select(x => x.OrdenCompraDetalleId).Distinct().ToList();

        var ordenDetalles = await dbContext.OrdenesCompraDetalles
            .Where(x =>
                x.OrdenCompraId == ordenCompraId &&
                ordenDetalleIds.Contains(x.Id) &&
                x.Activo)
            .ToListAsync(cancellationToken);

        var loteIds = detalles
            .Where(x => x.LoteId.HasValue)
            .Select(x => x.LoteId!.Value)
            .Distinct()
            .ToList();

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
            var ordenDetalle = ordenDetalles
                .FirstOrDefault(x => x.Id == detalle.OrdenCompraDetalleId);

            if (ordenDetalle is null)
            {
                throw new NotFoundException(
                    nameof(OrdenCompraDetalleEntity),
                    detalle.OrdenCompraDetalleId);
            }

            if (detalle.CantidadRecibida <= 0)
            {
                throw new BusinessException(
                    "La cantidad recibida de cada detalle debe ser mayor que cero.");
            }

            if (detalle.LoteId.HasValue && !loteIdsValidos.Contains(detalle.LoteId.Value))
            {
                throw new NotFoundException("Lote", detalle.LoteId.Value);
            }
        }
    }

    private static RecepcionCompraDetalleEntity CrearDetalle(
        RecepcionCompraDetalleRequest request,
        OrdenCompraDetalleEntity ordenDetalle)
    {
        return new RecepcionCompraDetalleEntity
        {
            OrdenCompraDetalleId = request.OrdenCompraDetalleId,
            ProductoId = ordenDetalle.ProductoId,
            LoteId = request.LoteId,
            CantidadRecibida = request.CantidadRecibida,
            PrecioUnitario = request.PrecioUnitario,
            Observacion = Limpiar(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        RecepcionCompraEntity entity,
        IReadOnlyCollection<RecepcionCompraDetalleRequest> detalles,
        IReadOnlyCollection<OrdenCompraDetalleEntity> ordenDetalles)
    {
        foreach (var existing in entity.Detalles.Where(x => x.Activo))
        {
            existing.Activo = false;
        }

        foreach (var detalle in detalles)
        {
            var ordenDetalle = ordenDetalles
                .First(d => d.Id == detalle.OrdenCompraDetalleId);

            entity.Detalles.Add(CrearDetalle(detalle, ordenDetalle));
        }
    }

    private async Task ActualizarOrdenCompra(
        RecepcionCompraEntity entity,
        IReadOnlyCollection<RecepcionCompraDetalleEntity> detallesRecibidos,
        CancellationToken cancellationToken)
    {
        var ordenCompra = await dbContext.OrdenesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(
                x => x.Id == entity.OrdenCompraId,
                cancellationToken);

        if (ordenCompra is null)
        {
            return;
        }

        foreach (var detalleRecibido in detallesRecibidos)
        {
            var ordenDetalle = ordenCompra.Detalles
                .FirstOrDefault(x => x.Id == detalleRecibido.OrdenCompraDetalleId);

            if (ordenDetalle is not null)
            {
                ordenDetalle.CantidadRecibida += detalleRecibido.CantidadRecibida;
            }
        }

        var completa = ordenCompra.Detalles
            .Where(x => x.Activo)
            .All(x => x.CantidadRecibida >= x.Cantidad);

        var actualizarEstado = ordenCompra.Estado is
            Clinica.Api.Modules.Compras.OrdenCompra.Enums.EstadoOrdenCompra.EnviadaProveedor or
            Clinica.Api.Modules.Compras.OrdenCompra.Enums.EstadoOrdenCompra.ParcialmenteRecibida;

        if (actualizarEstado)
        {
            ordenCompra.Estado = completa
                ? Clinica.Api.Modules.Compras.OrdenCompra.Enums.EstadoOrdenCompra.Recibida
                : Clinica.Api.Modules.Compras.OrdenCompra.Enums.EstadoOrdenCompra.ParcialmenteRecibida;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<RecepcionCompraEntity> ObtenerCabeceraAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.RecepcionesCompra
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(RecepcionCompraEntity), id);
        }

        return entity;
    }

    private async Task<RecepcionCompraEntity> ObtenerCabeceraConDetallesAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.RecepcionesCompra
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(RecepcionCompraEntity), id);
        }

        return entity;
    }

    private static RecepcionCompraResponse Mapear(
        RecepcionCompraEntity entity,
        string? ordenCompraNumero,
        string? proveedorRazonSocial,
        string? almacenNombre,
        ICollection<RecepcionCompraDetalleEntity>? detalles)
    {
        var response = RecepcionCompraMapper.ToResponse(entity);
        return response with
        {
            OrdenCompraNumero = ordenCompraNumero,
            ProveedorRazonSocial = proveedorRazonSocial,
            AlmacenNombre = almacenNombre,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(MapearDetalle)
                .ToList()
        };
    }

    private static RecepcionCompraDetalleResponse MapearDetalle(
        RecepcionCompraDetalleEntity entity)
    {
        var response = RecepcionCompraMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            ProductoCodigo = entity.Producto?.Codigo,
            LoteNumero = entity.Lote?.NumeroLote
        };
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
