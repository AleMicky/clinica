using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Dtos;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Enums;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using TransferenciaDetalleEntity = Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity.TransferenciaAlmacenDetalle;
using TransferenciaEntity = Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Entity.TransferenciaAlmacen;
using TransferenciaMapper = Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Mappers.TransferenciaAlmacenMapper;

namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Services;

public interface ITransferenciaAlmacenService
{
    Task<PagedResult<TransferenciaAlmacenResponse>> ListarAsync(
        int? almacenOrigenId,
        int? almacenDestinoId,
        EstadoTransferenciaAlmacen? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> CrearAsync(
        CreateTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> ActualizarAsync(
        int id,
        UpdateTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> SolicitarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> AprobarAsync(
        int id,
        AprobarTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> DespacharAsync(
        int id,
        DespacharTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> RecibirAsync(
        int id,
        RecibirTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default);

    Task<TransferenciaAlmacenResponse> CancelarAsync(
        int id,
        CancelarTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class TransferenciaAlmacenService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService)
    : ITransferenciaAlmacenService
{
    public async Task<PagedResult<TransferenciaAlmacenResponse>> ListarAsync(
        int? almacenOrigenId,
        int? almacenDestinoId,
        EstadoTransferenciaAlmacen? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .TransferenciasAlmacen
            .AsNoTracking()
            .Where(x => x.Activo);

        if (almacenOrigenId.HasValue)
        {
            query = query.Where(x => x.AlmacenOrigenId == almacenOrigenId.Value);
        }

        if (almacenDestinoId.HasValue)
        {
            query = query.Where(x => x.AlmacenDestinoId == almacenDestinoId.Value);
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

        var transferencias = await query
            .OrderByDescending(x => x.FechaSolicitud)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.AlmacenOrigen)
            .Include(x => x.AlmacenDestino)
            .ToListAsync(cancellationToken);

        var items = transferencias
            .Select(x => Mapear(
                x,
                x.AlmacenOrigen?.Nombre,
                x.AlmacenDestino?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<TransferenciaAlmacenResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<TransferenciaAlmacenResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .TransferenciasAlmacen
            .AsNoTracking()
            .Include(x => x.AlmacenOrigen)
            .Include(x => x.AlmacenDestino)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
                .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(TransferenciaEntity), id);
        }

        return Mapear(
            entity,
            entity.AlmacenOrigen?.Nombre,
            entity.AlmacenDestino?.Nombre,
            entity.Detalles);
    }

    public async Task<TransferenciaAlmacenResponse> CrearAsync(
        CreateTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La transferencia debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenOrigenId,
            request.AlmacenDestinoId,
            request.Numero,
            idExcluido: null,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var entity = TransferenciaMapper.ToEntity(request);
        NormalizarEncabezado(entity, request);

        dbContext.TransferenciasAlmacen.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<TransferenciaAlmacenResponse> ActualizarAsync(
        int id,
        UpdateTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "La transferencia debe tener al menos un detalle.");
        }

        var entity = await dbContext.TransferenciasAlmacen
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(TransferenciaEntity), id);
        }

        if (entity.Estado != EstadoTransferenciaAlmacen.Borrador)
        {
            throw new ConflictException(
                "No se puede editar una transferencia que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenOrigenId,
            request.AlmacenDestinoId,
            request.Numero,
            idExcluido: id,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.AlmacenOrigenId = request.AlmacenOrigenId;
        entity.AlmacenDestinoId = request.AlmacenDestinoId;
        entity.FechaSolicitud = request.FechaSolicitud;
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
        var entity = await dbContext.TransferenciasAlmacen
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(TransferenciaEntity), id);
        }

        if (entity.Estado != EstadoTransferenciaAlmacen.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar una transferencia que no esté en estado Borrador. Cancélala en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<TransferenciaAlmacenResponse> SolicitarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoTransferenciaAlmacen.Borrador)
        {
            throw new ConflictException(
                $"No se puede solicitar una transferencia en estado {entity.Estado}.");
        }

        entity.Estado = EstadoTransferenciaAlmacen.Solicitada;
        entity.SolicitadoPorId = ObtenerUsuarioActual();
        entity.FechaSolicitud = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<TransferenciaAlmacenResponse> AprobarAsync(
        int id,
        AprobarTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraConDetallesAsync(id, cancellationToken);

        if (entity.Estado != EstadoTransferenciaAlmacen.Solicitada)
        {
            throw new ConflictException(
                $"No se puede aprobar una transferencia en estado {entity.Estado}.");
        }

        AplicarCantidades(entity, request.Cantidades, EstadoTransferenciaAlmacen.Aprobada);

        entity.Estado = EstadoTransferenciaAlmacen.Aprobada;
        entity.AprobadoPorId = ObtenerUsuarioActual();
        entity.FechaAprobacion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<TransferenciaAlmacenResponse> DespacharAsync(
        int id,
        DespacharTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraConDetallesAsync(id, cancellationToken);

        if (entity.Estado != EstadoTransferenciaAlmacen.Aprobada)
        {
            throw new ConflictException(
                $"No se puede despachar una transferencia en estado {entity.Estado}.");
        }

        AplicarCantidades(entity, request.Cantidades, EstadoTransferenciaAlmacen.Despachada);

        entity.Estado = EstadoTransferenciaAlmacen.Despachada;
        entity.DespachadoPorId = ObtenerUsuarioActual();
        entity.FechaDespacho = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<TransferenciaAlmacenResponse> RecibirAsync(
        int id,
        RecibirTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraConDetallesAsync(id, cancellationToken);

        if (entity.Estado != EstadoTransferenciaAlmacen.Despachada)
        {
            throw new ConflictException(
                $"No se puede recibir una transferencia en estado {entity.Estado}.");
        }

        AplicarCantidades(entity, request.Cantidades, EstadoTransferenciaAlmacen.Recibida);

        entity.Estado = EstadoTransferenciaAlmacen.Recibida;
        entity.RecibidoPorId = ObtenerUsuarioActual();
        entity.FechaRecepcion = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<TransferenciaAlmacenResponse> CancelarAsync(
        int id,
        CancelarTransferenciaAlmacenRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado == EstadoTransferenciaAlmacen.Recibida ||
            entity.Estado == EstadoTransferenciaAlmacen.Cancelada)
        {
            throw new ConflictException(
                $"No se puede cancelar una transferencia en estado {entity.Estado}.");
        }

        entity.Estado = EstadoTransferenciaAlmacen.Cancelada;
        entity.Observacion = request.MotivoCancelacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarEncabezadoAsync(
        int almacenOrigenId,
        int almacenDestinoId,
        string numero,
        int? idExcluido,
        CancellationToken cancellationToken)
    {
        var paresAlmacenes = await dbContext.Almacenes
            .Where(x => x.Activo && (x.Id == almacenOrigenId || x.Id == almacenDestinoId))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        if (!paresAlmacenes.Contains(almacenOrigenId))
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenOrigenId);
        }

        if (!paresAlmacenes.Contains(almacenDestinoId))
        {
            throw new NotFoundException(nameof(AlmacenEntity), almacenDestinoId);
        }

        if (almacenOrigenId == almacenDestinoId)
        {
            throw new BusinessException(
                "El almacén de origen y destino deben ser distintos.");
        }

        var numeroNormalizado = NormalizarNumero(numero);

        var existeNumero = await dbContext.TransferenciasAlmacen
            .AnyAsync(
                x => x.Numero == numeroNormalizado &&
                     (!idExcluido.HasValue || x.Id != idExcluido.Value),
                cancellationToken);

        if (existeNumero)
        {
            throw new ConflictException(
                $"Ya existe una transferencia con el número '{numeroNormalizado}'.");
        }
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<TransferenciaAlmacenDetalleRequest> detalles,
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
            if (detalle.CantidadSolicitada <= 0)
            {
                throw new BusinessException(
                    "La cantidad solicitada de cada detalle debe ser mayor que cero.");
            }

            if (!productosActivos.Contains(detalle.ProductoId))
            {
                throw new NotFoundException(nameof(ProductoEntity), detalle.ProductoId);
            }

            if (detalle.LoteId.HasValue && !loteIdsValidos.Contains(detalle.LoteId.Value))
            {
                throw new NotFoundException(nameof(LoteEntity), detalle.LoteId.Value);
            }
        }
    }

    private static TransferenciaDetalleEntity CrearDetalle(
        TransferenciaAlmacenDetalleRequest request)
    {
        return new TransferenciaDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            CantidadSolicitada = request.CantidadSolicitada
        };
    }

    private static void ReemplazarDetalles(
        TransferenciaEntity entity,
        IReadOnlyCollection<TransferenciaAlmacenDetalleRequest> detalles)
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

    private static void AplicarCantidades(
        TransferenciaEntity entity,
        IReadOnlyCollection<TransferenciaDetalleCantidadRequest> cantidades,
        EstadoTransferenciaAlmacen estado)
    {
        var porId = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(x => x.Id);

        var vistos = new HashSet<int>();

        foreach (var item in cantidades)
        {
            if (item.Cantidad < 0)
            {
                throw new BusinessException(
                    "Las cantidades de la transición no pueden ser negativas.");
            }

            if (!porId.TryGetValue(item.DetalleId, out var detalle))
            {
                throw new NotFoundException(
                    nameof(TransferenciaDetalleEntity),
                    item.DetalleId);
            }

            vistos.Add(item.DetalleId);

            switch (estado)
            {
                case EstadoTransferenciaAlmacen.Aprobada:
                    detalle.CantidadAprobada = item.Cantidad;
                    break;
                case EstadoTransferenciaAlmacen.Despachada:
                    detalle.CantidadDespachada = item.Cantidad;
                    break;
                case EstadoTransferenciaAlmacen.Recibida:
                    detalle.CantidadRecibida = item.Cantidad;
                    break;
            }
        }
    }

    private async Task<TransferenciaEntity> ObtenerCabeceraAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.TransferenciasAlmacen
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(TransferenciaEntity), id);
        }

        return entity;
    }

    private async Task<TransferenciaEntity> ObtenerCabeceraConDetallesAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.TransferenciasAlmacen
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(TransferenciaEntity), id);
        }

        return entity;
    }

    private static TransferenciaAlmacenResponse Mapear(
        TransferenciaEntity entity,
        string? nombreOrigen,
        string? nombreDestino,
        ICollection<TransferenciaDetalleEntity>? detalles)
    {
        var response = TransferenciaMapper.ToResponse(entity);
        return response with
        {
            AlmacenOrigenNombre = nombreOrigen,
            AlmacenDestinoNombre = nombreDestino,
            Detalles = (detalles ?? [])
                .Where(x => x.Activo)
                .Select(x => MapearDetalle(x))
                .ToList()
        };
    }

    private static TransferenciaAlmacenDetalleResponse MapearDetalle(
        TransferenciaDetalleEntity entity)
    {
        var response = TransferenciaMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            LoteNumero = entity.Lote?.NumeroLote
        };
    }

    private static void NormalizarEncabezado(
        TransferenciaEntity entity,
        TransferenciaAlmacenRequest request)
    {
        entity.Numero = NormalizarNumero(request.Numero);
        entity.Observacion = Limpiar(request.Observacion);
    }

    private static string NormalizarNumero(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private int? ObtenerUsuarioActual()
    {
        var userId = currentUserService.UserId;

        if (userId is null)
        {
            throw new UnauthorizedAccessException();
        }

        return userId;
    }

    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
