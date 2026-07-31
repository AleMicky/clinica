using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.Modules.Almacen.Application.Transferencias;
using Clinica.Modules.Almacen.Domain.Entities;
using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.Modules.Almacen.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Almacen.Infrastructure.Services;

public sealed class TransferenciaAlmacenService(
    AlmacenDbContext context,
    ICorrelativoService correlativoService,
    IAlmacenStockService stockService) : ITransferenciaAlmacenService
{
    public const string CorrelativoCodigo = "ALM_TRANSFERENCIA";

    public async Task<PagedResult<TransferenciaListItemResponse>> GetPagedAsync(
        TransferenciaPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = context.TransferenciasAlmacen
            .AsNoTracking()
            .Include(x => x.AlmacenOrigen)
            .Include(x => x.AlmacenDestino)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Estado)
            && Enum.TryParse<EstadoTransferenciaAlmacen>(request.Estado, true, out var estado))
            query = query.Where(x => x.Estado == estado);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x => x.Numero.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.FechaSolicitud)
            .Select(x => new TransferenciaListItemResponse(
                x.Id,
                x.Numero,
                x.FechaSolicitud,
                x.AlmacenOrigen.Nombre,
                x.AlmacenDestino.Nombre,
                x.Estado.ToString()))
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<TransferenciaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadAsync(id, asTracking: false, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<TransferenciaResponse> CreateAsync(
        CreateTransferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureAlmacenAsync(request.AlmacenOrigenId, cancellationToken);
        await EnsureAlmacenAsync(request.AlmacenDestinoId, cancellationToken);

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(CorrelativoCodigo, Prefijo: "TRF-", Longitud: 6),
            cancellationToken);

        var entity = new TransferenciaAlmacen
        {
            Id = Guid.NewGuid(),
            Numero = correlativo.NumeroFormateado,
            FechaSolicitud = DateTime.UtcNow,
            AlmacenOrigenId = request.AlmacenOrigenId,
            AlmacenDestinoId = request.AlmacenDestinoId,
            EmpleadoSolicitanteId = request.EmpleadoSolicitanteId,
            Estado = EstadoTransferenciaAlmacen.Borrador,
            Observacion = request.Observacion,
            CreatedAt = DateTime.UtcNow,
        };

        foreach (var d in request.Detalles)
        {
            await EnsureProductoAsync(d.ProductoId, cancellationToken);
            entity.Detalles.Add(new TransferenciaAlmacenDetalle
            {
                Id = Guid.NewGuid(),
                TransferenciaAlmacenId = entity.Id,
                ProductoId = d.ProductoId,
                ProductoLoteOrigenId = d.ProductoLoteOrigenId,
                CantidadSolicitada = d.CantidadSolicitada,
                Observacion = d.Observacion,
                CreatedAt = DateTime.UtcNow,
            });
        }

        context.TransferenciasAlmacen.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<TransferenciaResponse> SolicitarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoTransferenciaAlmacen.Borrador);
        entity.Estado = EstadoTransferenciaAlmacen.Solicitada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<TransferenciaResponse> AprobarAsync(
        Guid id,
        AprobarTransferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoTransferenciaAlmacen.Solicitada);
        entity.Estado = EstadoTransferenciaAlmacen.Aprobada;
        entity.EmpleadoAprobadorId = request.EmpleadoAprobadorId;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<TransferenciaResponse> PrepararAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoTransferenciaAlmacen.Aprobada);
        entity.Estado = EstadoTransferenciaAlmacen.EnPreparacion;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<TransferenciaResponse> EnviarAsync(
        Guid id,
        EnviarTransferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        if (entity.Estado is not (EstadoTransferenciaAlmacen.Aprobada or EstadoTransferenciaAlmacen.EnPreparacion))
            throw new BusinessException($"No se puede enviar en estado {entity.Estado}.");

        var lineas = entity.Detalles.Select(d =>
        {
            d.CantidadEnviada = d.CantidadSolicitada;
            return new MovimientoDetalleLineaRequest(
                d.ProductoId,
                d.ProductoLoteOrigenId,
                d.CantidadEnviada);
        }).ToList();

        await stockService.RegistrarTransferenciaAsync(
            new RegistrarTransferenciaRequest(
                lineas,
                entity.Observacion,
                request.EmpleadoDespachoId,
                entity.AlmacenOrigenId,
                entity.AlmacenDestinoId),
            cancellationToken);

        entity.Estado = EstadoTransferenciaAlmacen.Enviada;
        entity.EmpleadoDespachoId = request.EmpleadoDespachoId;
        entity.FechaEnvio = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<TransferenciaResponse> RecibirAsync(
        Guid id,
        RecibirTransferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoTransferenciaAlmacen.Enviada);

        foreach (var d in entity.Detalles)
            d.CantidadRecibida = d.CantidadEnviada;

        entity.Estado = EstadoTransferenciaAlmacen.Recibida;
        entity.EmpleadoRecepcionId = request.EmpleadoRecepcionId;
        entity.FechaRecepcion = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken))!;
    }

    public async Task<TransferenciaResponse> RechazarAsync(
        Guid id,
        RechazarTransferenciaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        EnsureEstado(entity, EstadoTransferenciaAlmacen.Solicitada);
        entity.Estado = EstadoTransferenciaAlmacen.Rechazada;
        entity.EmpleadoAprobadorId = request.EmpleadoId;
        if (!string.IsNullOrWhiteSpace(request.Motivo))
            entity.Observacion = string.IsNullOrWhiteSpace(entity.Observacion)
                ? request.Motivo
                : $"{entity.Observacion}\nRechazo: {request.Motivo}";
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<TransferenciaResponse> AnularAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadRequiredAsync(id, cancellationToken);
        if (entity.Estado is not (EstadoTransferenciaAlmacen.Borrador or EstadoTransferenciaAlmacen.Solicitada))
            throw new BusinessException($"No se puede anular en estado {entity.Estado}.");

        entity.Estado = EstadoTransferenciaAlmacen.Anulada;
        entity.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    private async Task<TransferenciaAlmacen?> LoadAsync(Guid id, bool asTracking, CancellationToken cancellationToken)
    {
        IQueryable<TransferenciaAlmacen> query = context.TransferenciasAlmacen
            .Include(x => x.AlmacenOrigen)
            .Include(x => x.AlmacenDestino)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.Producto)
            .Include(x => x.Detalles)
            .ThenInclude(d => d.ProductoLoteOrigen);

        if (!asTracking)
            query = query.AsNoTracking();

        return await query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<TransferenciaAlmacen> LoadRequiredAsync(Guid id, CancellationToken cancellationToken) =>
        await LoadAsync(id, asTracking: true, cancellationToken)
            ?? throw new NotFoundException("Transferencia no encontrada.");

    private async Task EnsureAlmacenAsync(Guid id, CancellationToken cancellationToken)
    {
        if (!await context.Almacenes.AnyAsync(x => x.Id == id, cancellationToken))
            throw new NotFoundException("Almacén no encontrado.");
    }

    private async Task EnsureProductoAsync(Guid id, CancellationToken cancellationToken)
    {
        if (!await context.Productos.AnyAsync(x => x.Id == id && x.Activo, cancellationToken))
            throw new NotFoundException("Producto no encontrado o inactivo.");
    }

    private static void EnsureEstado(TransferenciaAlmacen entity, EstadoTransferenciaAlmacen expected)
    {
        if (entity.Estado != expected)
            throw new BusinessException($"La transferencia debe estar en estado {expected}.");
    }

    private static TransferenciaResponse Map(TransferenciaAlmacen e) =>
        new(
            e.Id,
            e.Numero,
            e.FechaSolicitud,
            e.AlmacenOrigenId,
            e.AlmacenOrigen?.Nombre ?? string.Empty,
            e.AlmacenDestinoId,
            e.AlmacenDestino?.Nombre ?? string.Empty,
            e.EmpleadoSolicitanteId,
            e.EmpleadoAprobadorId,
            e.EmpleadoDespachoId,
            e.EmpleadoRecepcionId,
            e.FechaEnvio,
            e.FechaRecepcion,
            e.Estado.ToString(),
            e.Observacion,
            e.Detalles.Select(d => new TransferenciaDetalleResponse(
                d.Id,
                d.ProductoId,
                d.Producto?.Codigo ?? string.Empty,
                d.Producto?.Nombre ?? string.Empty,
                d.ProductoLoteOrigenId,
                d.ProductoLoteOrigen?.NumeroLote,
                d.CantidadSolicitada,
                d.CantidadEnviada,
                d.CantidadRecibida,
                d.Observacion)).ToList());
}
