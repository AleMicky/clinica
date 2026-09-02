using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Dtos;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Enums;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Enums;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Services;
using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
using ExistenciaEntity = Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;
using InventarioFisicoDetalleEntity = Clinica.Api.Modules.Almacenes.InventarioFisico.Entity.InventarioFisicoDetalle;
using InventarioFisicoEntity = Clinica.Api.Modules.Almacenes.InventarioFisico.Entity.InventarioFisico;
using InventarioFisicoMapper = Clinica.Api.Modules.Almacenes.InventarioFisico.Mappers.InventarioFisicoMapper;
using LoteEntity = Clinica.Api.Modules.Almacenes.Lote.Entity.Lote;
using MovimientoDetalleEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventarioDetalle;
using MovimientoEntity = Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity.MovimientoInventario;
using ProductoEntity = Clinica.Api.Modules.Almacenes.Producto.Entity.Producto;
using TipoMovimientoInventarioEntity =
    Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity.TipoMovimientoInventario;

namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Services;

public interface IInventarioFisicoService
{
    Task<PagedResult<InventarioFisicoResponse>> ListarAsync(
        int? almacenId,
        EstadoInventarioFisico? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> CrearAsync(
        CreateInventarioFisicoRequest request,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> ActualizarAsync(
        int id,
        UpdateInventarioFisicoRequest request,
        CancellationToken cancellationToken = default);

    Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> IniciarConteoAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> RegistrarConteoAsync(
        int id,
        RegistrarConteoInventarioFisicoRequest request,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> CerrarAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<InventarioFisicoResponse> AnularAsync(
        int id,
        AnularInventarioFisicoRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class InventarioFisicoService(
    AppDbContext dbContext,
    ICorrelativoService correlativoService
)
    : IInventarioFisicoService
{
    private const string CodigoTipoAjusteEntrada = "AJUSTE_INV_ENTRADA";
    private const string CodigoTipoAjusteSalida = "AJUSTE_INV_SALIDA";
    private const string ReferenciaInventarioFisico = "InventarioFisico";

    public async Task<PagedResult<InventarioFisicoResponse>> ListarAsync(
        int? almacenId,
        EstadoInventarioFisico? estado,
        string? search,
        PaginationRequest pagination,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext
            .InventariosFisicos
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

        var inventarios = await query
            .OrderByDescending(x => x.FechaInicio)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(x => x.Almacen)
            .ToListAsync(cancellationToken);

        var items = inventarios
            .Select(x => Mapear(
                x,
                x.Almacen?.Nombre,
                detalles: null))
            .ToList();

        return new PagedResult<InventarioFisicoResponse>(
            items,
            page,
            pageSize,
            totalItems);
    }

    public async Task<InventarioFisicoResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext
            .InventariosFisicos
            .AsNoTracking()
            .Include(x => x.Almacen)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Lote)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null || !entity.Activo)
        {
            throw new NotFoundException(nameof(InventarioFisicoEntity), id);
        }

        return Mapear(
            entity,
            entity.Almacen?.Nombre,
            entity.Detalles);
    }

    public async Task<InventarioFisicoResponse> CrearAsync(
        CreateInventarioFisicoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "El inventario físico debe tener al menos un detalle.");
        }

        await ValidarEncabezadoAsync(request.AlmacenId, cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
        {
            Codigo = "FIS",
            Gestion = DateTime.Now.Year,
            Prefijo = "FIS",
            Longitud = 6
        }, cancellationToken);

        var entity = InventarioFisicoMapper.ToEntity(request);
        entity.Numero = correlativo.NumeroFormateado;
        NormalizarEncabezado(entity, request);

        dbContext.InventariosFisicos.Add(entity);

        foreach (var detalle in request.Detalles)
        {
            entity.Detalles.Add(CrearDetalle(detalle));
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task<InventarioFisicoResponse> ActualizarAsync(int id, UpdateInventarioFisicoRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException(
                "El inventario físico debe tener al menos un detalle.");
        }

        var entity = await dbContext.InventariosFisicos
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(InventarioFisicoEntity), id);
        }

        if (entity.Estado != EstadoInventarioFisico.Borrador)
        {
            throw new ConflictException(
                "No se puede editar un inventario físico que no esté en estado Borrador.");
        }

        await ValidarEncabezadoAsync(
            request.AlmacenId,
            cancellationToken);

        await ValidarDetallesAsync(request.Detalles, cancellationToken);

        entity.AlmacenId = request.AlmacenId;
        entity.FechaInicio = request.FechaInicio;
        entity.Observacion = Limpiar(request.Observacion);

        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task EliminarAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.InventariosFisicos
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(InventarioFisicoEntity), id);
        }

        if (entity.Estado != EstadoInventarioFisico.Borrador)
        {
            throw new ConflictException(
                "No se puede eliminar un inventario físico que no esté en estado Borrador. Anúlalo en su lugar.");
        }

        entity.Activo = false;
        foreach (var detalle in entity.Detalles)
        {
            detalle.Activo = false;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<InventarioFisicoResponse> IniciarConteoAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado != EstadoInventarioFisico.Borrador)
        {
            throw new ConflictException($"No se puede iniciar el conteo de un inventario en estado {entity.Estado}.");
        }

        entity.Estado = EstadoInventarioFisico.EnConteo;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<InventarioFisicoResponse> RegistrarConteoAsync(
        int id,
        RegistrarConteoInventarioFisicoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.InventariosFisicos
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(InventarioFisicoEntity), id);
        }

        if (entity.Estado != EstadoInventarioFisico.EnConteo)
        {
            throw new ConflictException($"No se puede registrar el conteo de un inventario en estado {entity.Estado}.");
        }

        var detallesActivos = entity.Detalles
            .Where(x => x.Activo)
            .ToDictionary(x => x.Id);

        foreach (var item in request.Conteo)
        {
            if (!detallesActivos.TryGetValue(item.DetalleId, out var detalle))
            {
                throw new NotFoundException(nameof(InventarioFisicoDetalleEntity), item.DetalleId);
            }

            detalle.CantidadContada = item.CantidadContada;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<InventarioFisicoResponse> CerrarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.InventariosFisicos
            .Include(x => x.Detalles)
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(InventarioFisicoEntity), id);
        }

        if (entity.Estado == EstadoInventarioFisico.Cerrado)
        {
            throw new ConflictException("El inventario físico ya está cerrado.");
        }

        if (entity.Estado == EstadoInventarioFisico.Anulado)
        {
            throw new ConflictException("No se puede cerrar un inventario físico anulado.");
        }

        var detallesActivos = entity.Detalles
            .Where(x => x.Activo)
            .ToList();

        if (detallesActivos.Any(x => !x.CantidadContada.HasValue))
        {
            throw new BusinessException(
                "Todos los detalles del inventario deben tener una cantidad contada antes de cerrar.");
        }

        await using var transaction =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var detallesPositivos = detallesActivos
            .Where(x => x.Diferencia > 0)
            .ToList();

        var detallesNegativos = detallesActivos
            .Where(x => x.Diferencia < 0)
            .ToList();

        var ajustePositivoTipoId = detallesPositivos.Count > 0
            ? (await ObtenerTipoAjustePorCodigoAsync(
                CodigoTipoAjusteEntrada,
                NaturalezaMovimiento.Entrada,
                cancellationToken)).Id
            : (int?)null;

        var ajusteNegativoTipoId = detallesNegativos.Count > 0
            ? (await ObtenerTipoAjustePorCodigoAsync(
                CodigoTipoAjusteSalida,
                NaturalezaMovimiento.Salida,
                cancellationToken)).Id
            : (int?)null;

        foreach (var detalle in detallesActivos)
        {
            await AplicarDiferenciaExistenciaAsync(
                entity.AlmacenId,
                detalle.ProductoId,
                detalle.LoteId,
                detalle.Diferencia,
                cancellationToken);
        }

        var (movimientoPositivoId, movimientoNegativoId) =
            await CrearMovimientosAjusteAsync(
                entity,
                detallesPositivos,
                detallesNegativos,
                ajustePositivoTipoId,
                ajusteNegativoTipoId,
                cancellationToken);

        entity.MovimientoAjustePositivoId = movimientoPositivoId;
        entity.MovimientoAjusteNegativoId = movimientoNegativoId;
        entity.Estado = EstadoInventarioFisico.Cerrado;
        entity.FechaCierre = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    public async Task<InventarioFisicoResponse> AnularAsync(
        int id,
        AnularInventarioFisicoRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await ObtenerCabeceraAsync(id, cancellationToken);

        if (entity.Estado == EstadoInventarioFisico.Anulado)
        {
            throw new ConflictException("El inventario físico ya está anulado.");
        }

        if (entity.Estado == EstadoInventarioFisico.Cerrado)
        {
            throw new ConflictException("No se puede anular un inventario físico cerrado.");
        }

        entity.Estado = EstadoInventarioFisico.Anulado;
        entity.Observacion = request.MotivoAnulacion.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(id, cancellationToken);
    }

    private async Task ValidarEncabezadoAsync(
        int almacenId,
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
    }

    private async Task ValidarDetallesAsync(
        IReadOnlyCollection<InventarioFisicoDetalleRequest> detalles,
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

        var combinacionesVistas = new HashSet<(int ProductoId, int? LoteId)>();

        foreach (var detalle in detalles)
        {
            if (detalle.CantidadSistema < 0)
            {
                throw new BusinessException(
                    "La cantidad del sistema de cada detalle no puede ser negativa.");
            }

            if (detalle.CantidadContada.HasValue && detalle.CantidadContada.Value < 0)
            {
                throw new BusinessException(
                    "La cantidad contada de cada detalle no puede ser negativa.");
            }

            if (!productosActivos.Contains(detalle.ProductoId))
            {
                throw new NotFoundException(nameof(ProductoEntity), detalle.ProductoId);
            }

            if (detalle.LoteId.HasValue && !loteIdsValidos.Contains(detalle.LoteId.Value))
            {
                throw new NotFoundException(nameof(LoteEntity), detalle.LoteId.Value);
            }

            var combinacion = (detalle.ProductoId, detalle.LoteId);
            if (!combinacionesVistas.Add(combinacion))
            {
                throw new ConflictException(
                    $"El producto {detalle.ProductoId} se repite en el inventario. Agrupa los detalles por producto y lote.");
            }
        }
    }

    private static InventarioFisicoDetalleEntity CrearDetalle(InventarioFisicoDetalleRequest request)
    {
        return new InventarioFisicoDetalleEntity
        {
            ProductoId = request.ProductoId,
            LoteId = request.LoteId,
            CantidadSistema = request.CantidadSistema,
            CantidadContada = request.CantidadContada
        };
    }

    private static void ReemplazarDetalles(
        InventarioFisicoEntity entity,
        IReadOnlyCollection<InventarioFisicoDetalleRequest> detalles)
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

    private async Task<TipoMovimientoInventarioEntity> ObtenerTipoAjustePorCodigoAsync(
        string codigo,
        NaturalezaMovimiento naturaleza,
        CancellationToken cancellationToken)
    {
        var tipo = await dbContext.TiposMovimientoInventario
            .FirstOrDefaultAsync(
                x => x.Codigo == codigo && x.Naturaleza == naturaleza && x.Activo,
                cancellationToken);

        if (tipo is null)
        {
            throw new BusinessException(
                $"No existe un tipo de movimiento de inventario con código '{codigo}' y naturaleza {naturaleza}. " +
                "Configúralo antes de cerrar un inventario físico.");
        }

        return tipo;
    }

    private async Task AplicarDiferenciaExistenciaAsync(
        int almacenId,
        int productoId,
        int? loteId,
        decimal diferencia,
        CancellationToken cancellationToken)
    {
        if (diferencia == 0)
        {
            return;
        }

        var existencia = await dbContext.Existencias
            .FirstOrDefaultAsync(
                x => x.AlmacenId == almacenId &&
                     x.ProductoId == productoId &&
                     x.LoteId == loteId,
                cancellationToken);

        if (existencia is null)
        {
            if (diferencia < 0)
            {
                throw new BusinessException(
                    $"No se puede ajustar el stock del producto {productoId} porque la diferencia es negativa y no existe una existencia registrada en el almacén.");
            }

            dbContext.Existencias.Add(new ExistenciaEntity
            {
                AlmacenId = almacenId,
                ProductoId = productoId,
                LoteId = loteId,
                Cantidad = diferencia,
                CantidadReservada = 0
            });

            return;
        }

        var nuevaCantidad = existencia.Cantidad + diferencia;

        if (nuevaCantidad < 0)
        {
            throw new BusinessException(
                $"El ajuste del producto {productoId} deja el stock del almacén en un valor negativo.");
        }

        existencia.Cantidad = nuevaCantidad;
    }

    private async Task<(int? PositivoId, int? NegativoId)> CrearMovimientosAjusteAsync(
        InventarioFisicoEntity inventario,
        IReadOnlyCollection<InventarioFisicoDetalleEntity> detallesPositivos,
        IReadOnlyCollection<InventarioFisicoDetalleEntity> detallesNegativos,
        int? tipoAjusteEntradaId,
        int? tipoAjusteSalidaId,
        CancellationToken cancellationToken)
    {
        int? positivoId = null;
        int? negativoId = null;

        if (detallesPositivos.Count > 0)
        {
            var movimiento = new MovimientoEntity
            {
                Numero = $"INV{inventario.Id}-PA",
                TipoMovimientoInventarioId = tipoAjusteEntradaId!.Value,
                AlmacenId = inventario.AlmacenId,
                FechaMovimiento = DateTime.UtcNow,
                Estado = EstadoMovimientoInventario.Confirmado,
                FechaConfirmacion = DateTime.UtcNow,
                ReferenciaTipo = ReferenciaInventarioFisico,
                ReferenciaId = inventario.Id,
                Observacion = $"Ajuste positivo por inventario físico {inventario.Numero}"
            };

            foreach (var detalle in detallesPositivos)
            {
                movimiento.Detalles.Add(new MovimientoDetalleEntity
                {
                    ProductoId = detalle.ProductoId,
                    LoteId = detalle.LoteId,
                    Cantidad = detalle.Diferencia
                });
            }

            dbContext.MovimientosInventario.Add(movimiento);
            await dbContext.SaveChangesAsync(cancellationToken);

            positivoId = movimiento.Id;
        }

        if (detallesNegativos.Count > 0)
        {
            var movimiento = new MovimientoEntity
            {
                Numero = $"INV{inventario.Id}-NA",
                TipoMovimientoInventarioId = tipoAjusteSalidaId!.Value,
                AlmacenId = inventario.AlmacenId,
                FechaMovimiento = DateTime.UtcNow,
                Estado = EstadoMovimientoInventario.Confirmado,
                FechaConfirmacion = DateTime.UtcNow,
                ReferenciaTipo = ReferenciaInventarioFisico,
                ReferenciaId = inventario.Id,
                Observacion = $"Ajuste negativo por inventario físico {inventario.Numero}"
            };

            foreach (var detalle in detallesNegativos)
            {
                movimiento.Detalles.Add(new MovimientoDetalleEntity
                {
                    ProductoId = detalle.ProductoId,
                    LoteId = detalle.LoteId,
                    Cantidad = -detalle.Diferencia
                });
            }

            dbContext.MovimientosInventario.Add(movimiento);
            await dbContext.SaveChangesAsync(cancellationToken);

            negativoId = movimiento.Id;
        }

        return (positivoId, negativoId);
    }

    private async Task<InventarioFisicoEntity> ObtenerCabeceraAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.InventariosFisicos
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(InventarioFisicoEntity), id);
        }

        return entity;
    }

    private static InventarioFisicoResponse Mapear(InventarioFisicoEntity entity, string? nombreAlmacen,
        ICollection<InventarioFisicoDetalleEntity>? detalles)
    {
        var response = InventarioFisicoMapper.ToResponse(entity);
        return response with
        {
            AlmacenNombre = nombreAlmacen,
            Detalles = (detalles ?? [])
            .Where(x => x.Activo)
            .Select(x => MapearDetalle(x))
            .ToList()
        };
    }

    private static InventarioFisicoDetalleResponse MapearDetalle(
        InventarioFisicoDetalleEntity entity)
    {
        var response = InventarioFisicoMapper.ToResponse(entity);
        return response with
        {
            ProductoNombre = entity.Producto?.Nombre,
            LoteNumero = entity.Lote?.NumeroLote,
            Diferencia = entity.Diferencia
        };
    }

    private static void NormalizarEncabezado(
        InventarioFisicoEntity entity,
        InventarioFisicoRequest request)
    {
        entity.Observacion = Limpiar(request.Observacion);
    }


    private static string? Limpiar(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}