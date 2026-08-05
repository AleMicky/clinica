using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using MonedaEntity = Clinica.Api.Modules.Parametros.Moneda.Entity.Moneda;
using TipoCambioEntity = Clinica.Api.Modules.Parametros.Moneda.Entity.TipoCambio;

namespace Clinica.Api.Modules.Parametros.Moneda.Services;

public sealed class TipoCambioService(AppDbContext dbContext)
    : CrudService<
        TipoCambioEntity,
        CreateTipoCambioRequest,
        UpdateTipoCambioRequest,
        TipoCambioResponse
    >(dbContext)
{
    public override async Task<TipoCambioResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        return MapToResponse(entity);
    }

    public override async Task<TipoCambioResponse> CrearAsync(
        CreateTipoCambioRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateCreateAsync(request, cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<TipoCambioResponse> ActualizarAsync(
        int id,
        UpdateTipoCambioRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Entities
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw CreateNotFoundException(id);

        await ValidateUpdateAsync(
            id,
            request,
            entity,
            cancellationToken);

        MapToExistingEntity(request, entity);

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<TipoCambioEntity> ApplyOrder(
        IQueryable<TipoCambioEntity> query)
    {
        return query.OrderByDescending(x => x.Fecha);
    }

    protected override TipoCambioEntity MapToNewEntity(
        CreateTipoCambioRequest request)
    {
        return TipoCambioMapper.ToEntity(request);
    }

    protected override void MapToExistingEntity(
        UpdateTipoCambioRequest request,
        TipoCambioEntity entity)
    {
        TipoCambioMapper.UpdateEntity(request, entity);
    }

    protected override TipoCambioResponse MapToResponse(
        TipoCambioEntity entity)
    {
        return TipoCambioMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<TipoCambioResponse>
        MapToResponseList(IEnumerable<TipoCambioEntity> entities)
    {
        return TipoCambioMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateTipoCambioRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarMonedasAsync(
            request.MonedaOrigenId,
            request.MonedaDestinoId,
            cancellationToken);

        await ValidarUnicidadAsync(
            request.MonedaOrigenId,
            request.MonedaDestinoId,
            request.Fecha,
            null,
            cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateTipoCambioRequest request,
        TipoCambioEntity entity,
        CancellationToken cancellationToken)
    {
        await ValidarMonedasAsync(
            request.MonedaOrigenId,
            request.MonedaDestinoId,
            cancellationToken);

        await ValidarUnicidadAsync(
            request.MonedaOrigenId,
            request.MonedaDestinoId,
            request.Fecha,
            id,
            cancellationToken);
    }

    protected override IQueryable<TipoCambioEntity> ApplySearch(
        IQueryable<TipoCambioEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        if (DateOnly.TryParse(search, out var fecha))
        {
            return query.Where(x => x.Fecha == fecha);
        }

        return query;
    }

    private async Task ValidarMonedasAsync(
        int monedaOrigenId,
        int monedaDestinoId,
        CancellationToken cancellationToken)
    {
        if (monedaOrigenId == monedaDestinoId)
        {
            throw new BusinessException(
                "La moneda de origen y destino no pueden ser la misma.");
        }

        var existen = await DbContext.Set<MonedaEntity>()
            .CountAsync(
                x => (x.Id == monedaOrigenId || x.Id == monedaDestinoId)
                     && x.Activo,
                cancellationToken);

        if (existen != 2)
        {
            throw new NotFoundException(
                "Moneda",
                $"origen={monedaOrigenId}, destino={monedaDestinoId}");
        }
    }

    private async Task ValidarUnicidadAsync(
        int monedaOrigenId,
        int monedaDestinoId,
        DateOnly fecha,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existe = excludeId is null
            ? await Entities.AnyAsync(
                x => x.MonedaOrigenId == monedaOrigenId
                     && x.MonedaDestinoId == monedaDestinoId
                     && x.Fecha == fecha,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.MonedaOrigenId == monedaOrigenId
                     && x.MonedaDestinoId == monedaDestinoId
                     && x.Fecha == fecha
                     && x.Id != excludeId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un tipo de cambio para origen '{monedaOrigenId}', " +
                $"destino '{monedaDestinoId}' en la fecha '{fecha:yyyy-MM-dd}'.");
        }
    }
}