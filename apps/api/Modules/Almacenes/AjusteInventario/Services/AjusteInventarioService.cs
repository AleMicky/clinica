using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Dtos;
using Clinica.Api.Modules.Almacenes.AjusteInventario.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using AjusteDetalleEntity = Clinica.Api.Modules.Almacenes.AjusteInventario.Entity.AjusteInventarioDetalle;
using AjusteEntity = Clinica.Api.Modules.Almacenes.AjusteInventario.Entity.AjusteInventario;
using AjusteMapper = Clinica.Api.Modules.Almacenes.AjusteInventario.Mappers.AjusteInventarioMapper;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;

namespace Clinica.Api.Modules.Almacenes.AjusteInventario.Services;

public interface IAjusteInventarioService
{
    Task<PagedResult<AjusteInventarioResponse>> ListarAsync(
        int? almacenId,
        TipoAjusteInventario? tipo,
        EstadoAjusteInventario? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<AjusteInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<AjusteInventarioResponse> CrearAsync(
        CreateAjusteInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task<AjusteInventarioResponse> ActualizarAsync(
        int id,
        UpdateAjusteInventarioRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<AjusteInventarioResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<AjusteInventarioResponse> AnularAsync(
        int id,
        AnularAjusteInventarioRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class AjusteInventarioService(AppDbContext dbContext)
    : IAjusteInventarioService
{
    public async Task<PagedResult<AjusteInventarioResponse>> ListarAsync(
        int? almacenId,
        TipoAjusteInventario? tipo,
        EstadoAjusteInventario? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .AjustesInventario
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

        var ajustes = await query
            .OrderByDescending(x => x.Fecha)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = ajustes
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<AjusteInventarioResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<AjusteInventarioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var ajuste = await dbContext
            .AjustesInventario
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (ajuste is null || !ajuste.Activo)
        {
            throw new NotFoundException(nameof(AjusteEntity), id);
        }

        return Mapear(
            ajuste,
            ajuste.Almacen?.Nombre,
            ajuste.Detalles);
    }

    public async Task<AjusteInventarioResponse> CrearAsync(
        CreateAjusteInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "El ajuste de inventario debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            request.Numero,
            idExcluido: null,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = AjusteMapper.ToEntity(request);
        entity.Numero = NormalizarNumero(request.Numero);
        entity.Motivo = request.Motivo.Trim();
        entity.Observacion = Limpiar(request.Observacion);

        dbContext.AjustesInventario.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<AjusteInventarioResponse> ActualizarAsync(
        int id,
        UpdateAjusteInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "El ajuste de inventario debe tener al menos un detalle.");
        }

        var entity = await dbContext.AjustesInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(AjusteEntity), id);
        }

        if (entity.Estado != EstadoAjusteInventario.Borrador)
        {
            throw new ConflictException(
                "No se puede editar un ajuste que no esté en estado Borrador.");
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
        var entity = await dbContext.AjustesInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(AjusteEntity), id);
        }

        if (entity.Estado != EstadoAjusteInventario.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar un ajuste que no esté en estado Borrador. Anúlalo en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AjusteInventarioResponse> ConfirmarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.AjustesInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(AjusteEntity), id);
        }

        if (entity.Estado == EstadoAjusteInventario.Confirmado)
        {
            throw new ConflictException("El ajuste de inventario ya está confirmado.");
        }

        if (entity.Estado == EstadoAjusteInventario.Anulado)
        {
            throw new ConflictException("No se puede confirmar un ajuste anulado.");
        }

        entity.Estado = EstadoAjusteInventario.Confirmado;
        entity.FechaConfirmacion = DateTime.UtcNow;
        entity.FechaAnulacion = null;
        entity.MotivoAnulacion = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<AjusteInventarioResponse> AnularAsync(
        int id,
        AnularAjusteInventarioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.AjustesInventario
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(AjusteEntity), id);
        }

        if (entity.Estado == EstadoAjusteInventario.Anulado)
        {
            throw new ConflictException("El ajuste de inventario ya está anulado.");
        }

        if (entity.Estado == EstadoAjusteInventario.Borrador)
        {
            throw new ConflictException(
                "Un ajuste en estado Borrador debe eliminarse en lugar de anularse.");
        }

        entity.Estado = EstadoAjusteInventario.Anulado;
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

        var existeNumero = await dbContext.AjustesInventario
            .AnyAsync(
                x => x.Numero == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existeNumero)
        {
            throw new ConflictException(
                $"Ya existe un ajuste de inventario con el número '{numeroNormalizado}'.");
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<AjusteInventarioDetalleRequest> detalles,
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

    private static AjusteDetalleEntity CrearDetalle(
        AjusteInventarioDetalleRequest request)
    {
        return new AjusteDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            Cantidad = request.Cantidad
        };
    }

    private static void ReemplazarDetalles(
        AjusteEntity entity,
        IReadOnlyCollection<AjusteInventarioDetalleRequest> detalles)
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

    private static AjusteInventarioResponse Mapear(
        AjusteEntity entity,
        string? nombreAlmacen,
        ICollection<AjusteDetalleEntity>? detalles)
    {
        var response = AjusteMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(x => MapearDetalle(x))
                .ToList()
        };
    }

    private static AjusteInventarioDetalleResponse MapearDetalle(
        AjusteDetalleEntity entity)
    {
        var response = AjusteMapper.ToResponse(entity);
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
