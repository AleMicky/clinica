using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Area.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Area.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using AreaEntity = Clinica.Api.Modules.RecursosHumanos.Area.Entity.Area;
using TipoAreaEntity = Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity.TipoArea;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Services;

public sealed class AreaService(AppDbContext dbContext)
    : CrudService<
        AreaEntity,
        CreateAreaRequest,
        UpdateAreaRequest,
        AreaResponse
    >(dbContext)
{
    protected override IQueryable<AreaEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.TipoArea)
            .Include(x => x.AreaPadre);
    }

    protected override IQueryable<AreaEntity> ApplyOrder(
        IQueryable<AreaEntity> query)
    {
        return query
            .OrderBy(x => x.TipoArea.Nombre)
            .ThenBy(x => x.Nombre);
    }

    protected override AreaEntity MapToNewEntity(
        CreateAreaRequest request)
    {
        var entity = AreaMapper.ToEntity(request);
        Normalizar(entity, request);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateAreaRequest request,
        AreaEntity entity)
    {
        AreaMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);
    }

    protected override AreaResponse MapToResponse(
        AreaEntity entity)
    {
        var response = AreaMapper.ToResponse(entity);
        return response with
        {
            TipoAreaNombre = entity.TipoArea?.Nombre
        };
    }

    protected override IReadOnlyCollection<AreaResponse>
        MapToResponseList(IEnumerable<AreaEntity> entities)
    {
        return entities.Select(e => new AreaResponse
        {
            Id = e.Id,
            Codigo = e.Codigo,
            Nombre = e.Nombre,
            Descripcion = e.Descripcion,
            TipoAreaId = e.TipoAreaId,
            TipoAreaNombre = e.TipoArea?.Nombre,
            AreaPadreId = e.AreaPadreId,
            Activo = e.Activo,
            FechaCreacion = e.FechaCreacion,
            FechaModificacion = e.FechaModificacion,
            CreadoPor = e.CreadoPor,
            ModificadoPor = e.ModificadoPor
        }).ToList();
    }

    protected override async Task ValidateCreateAsync(
        CreateAreaRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarTipoAreaAsync(request.TipoAreaId, cancellationToken);
        await ValidarAreaPadreAsync(request.AreaPadreId, null, cancellationToken);
        await ValidarCodigoAsync(
            request.TipoAreaId,
            request.Codigo,
            null,
            cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateAreaRequest request,
        AreaEntity entity,
        CancellationToken cancellationToken)
    {
        await ValidarTipoAreaAsync(request.TipoAreaId, cancellationToken);
        await ValidarAreaPadreAsync(request.AreaPadreId, id, cancellationToken);
        await ValidarCodigoAsync(
            request.TipoAreaId,
            request.Codigo,
            id,
            cancellationToken);
    }

    protected override IQueryable<AreaEntity> ApplySearch(
        IQueryable<AreaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            x.TipoArea.Nombre.Contains(search));
    }

    public async Task<AreaArbolResponse> ObtenerArbolAsync(
        CancellationToken cancellationToken)
    {
        var areas = await BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo)
            .ToListAsync(cancellationToken);

        var porPadre = areas
            .GroupBy(x => x.AreaPadreId)
            .ToDictionary(
                g => g.Key ?? 0,
                g => g.ToList());

        AreaArbolResponse Construir(AreaEntity area)
        {
            var subareas = porPadre
                .GetValueOrDefault(area.Id, [])
                .Select(Construir)
                .ToList();

            return new AreaArbolResponse
            {
                Id = area.Id,
                Codigo = area.Codigo,
                Nombre = area.Nombre,
                TipoAreaId = area.TipoAreaId,
                TipoAreaNombre = area.TipoArea?.Nombre,
                Subareas = subareas
            };
        }

        var raices = porPadre.GetValueOrDefault(0, [])
            .Select(Construir)
            .ToList();

        return new AreaArbolResponse
        {
            Id = 0,
            Codigo = "RAIZ",
            Nombre = "Áreas",
            TipoAreaId = 0,
            TipoAreaNombre = null,
            Subareas = raices
        };
    }

    public async Task<List<AreaArbolResponse>> ObtenerSubareasAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var area = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (area is null)
            throw CreateNotFoundException(id);

        var subareas = await BuildQuery()
            .AsNoTracking()
            .Where(x => x.AreaPadreId == id && x.Activo)
            .ToListAsync(cancellationToken);

        var porPadre = (await BuildQuery()
                .AsNoTracking()
                .Where(x => x.Activo)
                .ToListAsync(cancellationToken))
            .GroupBy(x => x.AreaPadreId ?? 0)
            .ToDictionary(
                g => g.Key,
                g => g.ToList());

        AreaArbolResponse Construir(AreaEntity a)
        {
            var subs = porPadre
                .GetValueOrDefault(a.Id, [])
                .Select(Construir)
                .ToList();

            return new AreaArbolResponse
            {
                Id = a.Id,
                Codigo = a.Codigo,
                Nombre = a.Nombre,
                TipoAreaId = a.TipoAreaId,
                TipoAreaNombre = a.TipoArea?.Nombre,
                Subareas = subs
            };
        }

        return subareas.Select(Construir).ToList();
    }

    private async Task ValidarTipoAreaAsync(
        int tipoAreaId,
        CancellationToken cancellationToken)
    {
        var existe = await DbContext.Set<TipoAreaEntity>()
            .AnyAsync(
                x => x.Id == tipoAreaId && x.Activo,
                cancellationToken);

        if (!existe)
            throw new NotFoundException("TipoArea", tipoAreaId);
    }

    private async Task ValidarAreaPadreAsync(
        int? areaPadreId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        if (areaPadreId is null)
            return;

        if (excludeId.HasValue && areaPadreId == excludeId.Value)
        {
            throw new BusinessException(
                "Un área no puede ser subárea de sí misma.");
        }

        var existe = await Entities.AnyAsync(
            x => x.Id == areaPadreId && x.Activo,
            cancellationToken);

        if (!existe)
            throw new NotFoundException("Area", areaPadreId.Value);
    }

    private async Task ValidarCodigoAsync(
        int tipoAreaId,
        string codigo,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var codigoNorm = NormalizarCodigo(codigo);

        var existe = excludeId is null
            ? await Entities.AnyAsync(
                x => x.TipoAreaId == tipoAreaId
                     && x.Codigo == codigoNorm,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.TipoAreaId == tipoAreaId
                     && x.Codigo == codigoNorm
                     && x.Id != excludeId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un área con el código '{codigoNorm}' " +
                $"para el tipo de área '{tipoAreaId}'.");
        }
    }

    private static void Normalizar(
        AreaEntity entity,
        AreaRequest request)
    {
        entity.Codigo = NormalizarCodigo(request.Codigo);
        entity.Nombre = request.Nombre.Trim();
        entity.Descripcion = NormalizarOpcional(request.Descripcion);
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}