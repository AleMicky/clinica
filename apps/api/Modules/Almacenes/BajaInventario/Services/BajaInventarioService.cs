using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.BajaInventario.Dtos;
using Clinica.Api.Modules.Almacenes.BajaInventario.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using BajaDetalleEntity = Clinica.Api.Modules.Almacenes.BajaInventario.Entity.BajaInventarioDetalle;
using BajaEntity = Clinica.Api.Modules.Almacenes.BajaInventario.Entity.BajaInventario;
using BajaMapper = Clinica.Api.Modules.Almacenes.BajaInventario.Mappers.BajaInventarioMapper;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.BajaInventario.Services;

public interface IBajaInventarioService
{
    Task<PagedResult<BajaInventarioResponse>> ListarAsync(
        int? almacenId,
        TipoBajaInventario? tipo,
        EstadoBajaInventario? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<BajaInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<BajaInventarioResponse> CrearAsync(
        CreateBajaInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task<BajaInventarioResponse> ActualizarAsync(
        int id,
        UpdateBajaInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<BajaInventarioResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<BajaInventarioResponse> AnularAsync(
        int id,
        AnularBajaInventarioRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class BajaInventarioService(AppDbContext dbContext)
    : IBajaInventarioService
{
    public async Task<PagedResult<BajaInventarioResponse>> ListarAsync(
        int? almacenId,
        TipoBajaInventario? tipo,
        EstadoBajaInventario? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .BajasInventario
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenId.HasValue)
        {
            query = query.Where(x => x.AlmacenId == almacenId.Value);
        }

        if (tipo.HasValue)
        {
            query = query.Where(x => x.Tipo == tipo.Value);
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

        var bajas = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = bajas
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<BajaInventarioResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<BajaInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var baja = await dbContext
            .BajasInventario
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (baja is null || !baja.Activo)
        {
            throw new NotFoundException(nameof(BajaEntity), id);
        }

        return Mapear(
            baja,
            baja.Almacen?.Nombre,
            baja.Detalles);
    }

    public async Task<BajaInventarioResponse> CrearAsync(
        CreateBajaInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La baja de inventario debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.Numero,
            idExcluido: null,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = BajaMapper.ToEntity(request);
        entity.Numero = NormalizarNumero(request.Numero);
        entity.Motivo = request.Motivo.Trim();
        entity.Observacion = Limpiar(request.Observacion);

        dbContext.BajasInventario.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<BajaInventarioResponse> ActualizarAsync(
        int id,
        UpdateBajaInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La baja de inventario debe tener al menos un detalle.");
        }

        var entity = await dbContext.BajasInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(BajaEntity), id);
        }

        if (entity.Estado != EstadoBajaInventario.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una baja que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.Numero,
            idExcluido: id,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.AlmacenId = request.AlmacenId;
        entity.Tipo = request.Tipo;
        entity.Fecha = request.Fecha;
        entity.Motivo = request.Motivo.Trim();
        entity.Observacion = Limpiar(request.Observacion);
        entity.Numero = NormalizarNumero(request.Numero);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.BajasInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(BajaEntity), id);
        }

        if (entity.Estado != EstadoBajaInventario.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una baja que no esté en estado Borrador. Anúlala en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<BajaInventarioResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.BajasInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(BajaEntity), id);
        }

        if (entity.Estado == EstadoBajaInventario.Confirmado)
        {
            throw new ConflictException("La baja de inventario ya está confirmada.");
        }

        if (entity.Estado == EstadoBajaInventario.Anulado)
        {
            throw new ConflictException("No se puede confirmar una baja anulada.");
        }

        entity.Estado = EstadoBajaInventario.Confirmado;
        entity.FechaConfirmacion = DateTime.UtcNow;
        entity.FechaAnulacion = null;
        entity.MotivoAnulacion = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<BajaInventarioResponse> AnularAsync(
        int id,
        AnularBajaInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.BajasInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(BajaEntity), id);
        }

        if (entity.Estado == EstadoBajaInventario.Anulado)
        {
            throw new ConflictException("La baja de inventario ya está anulada.");
        }

        if (entity.Estado == EstadoBajaInventario.Borrador)
        {
            throw new ConflictException(
                "Una baja en estado Borrador debe eliminarse en lugar de anularse.");
        }

        entity.Estado = EstadoBajaInventario.Anulado;
        entity.FechaAnulacion = DateTime.UtcNow;
        entity.MotivoAnulacion = request.MotivoAnulacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarEncabezadoAsync(
        int almacenId,
        string numero,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var existeAlmacen = await dbContext.Almacenes
            .AnyAsync(
                x => x.Id == almacenId && x.Activo,
                cancellationToken);

        if (!existeAlmacen)
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenId);
        }

        var numeroNormalizado = NormalizarNumero(numero);

        var existeNumero = await dbContext.BajasInventario
            .AnyAsync(
                x => x.Numero == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existeNumero)
        {
            throw new ConflictException(
                $"Ya existe una baja de inventario con el número '{numeroNormalizado}'.");
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<BajaInventarioDetalleRequest> detalles,
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

            if (detalle.LoteId.HasValue)
            {
                if (!loteIdsValidos.Contains(detalle.LoteId.Value))
                {
                    throw new NotFoundException(nameof(LoteEntity), detalle.LoteId.Value);
                }
            }
        }
    }

    private static BajaDetalleEntity CrearDetalle(
        BajaInventarioDetalleRequest request)
    {
        return new BajaDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            Cantidad = request.Cantidad,
            Observacion = Limpiar(request.Observacion)
        };
    }

    private static void ReemplazarDetalles(
        BajaEntity entity,
        IReadOnlyCollection<BajaInventarioDetalleRequest> detalles)
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

    private static BajaInventarioResponse Mapear(
        BajaEntity entity,
        string? nombreAlmacen,
        ICollection<BajaDetalleEntity>? detalles)
    {
        var response = BajaMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(x => MapearDetalle(x))
                .ToList()
        };
    }

    private static BajaInventarioDetalleResponse MapearDetalle(
        BajaDetalleEntity entity)
    {
        var response = BajaMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            LoteNumero = entity.Lote?.NumeroLote
        };
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}