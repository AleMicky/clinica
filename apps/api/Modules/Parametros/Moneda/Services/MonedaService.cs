using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using MonedaEntity = Clinica.Api.Modules.Parametros.Moneda.Entity.Moneda;

namespace Clinica.Api.Modules.Parametros.Moneda.Services;

public sealed class MonedaService(AppDbContext dbContext)
    : CrudService<
        MonedaEntity,
        CreateMonedaRequest,
        UpdateMonedaRequest,
        MonedaResponse
    >(dbContext)
{
    public override async Task<MonedaResponse> CrearAsync(
        CreateMonedaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateCreateAsync(request, cancellationToken);

        var entity = MapToNewEntity(request);
        entity.Activo = true;

        if (entity.EsBase)
        {
            await DesmarcarOtrasBasesAsync(cancellationToken);
        }

        await Entities.AddAsync(entity, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    public override async Task<MonedaResponse> ActualizarAsync(
        int id,
        UpdateMonedaRequest request,
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

        if (entity.EsBase)
        {
            await DesmarcarOtrasBasesAsync(entity.Id, cancellationToken);
        }

        await DbContext.SaveChangesAsync(cancellationToken);

        return MapToResponse(entity);
    }

    protected override IQueryable<MonedaEntity> ApplyOrder(
        IQueryable<MonedaEntity> query)
    {
        return query
            .OrderByDescending(x => x.EsBase)
            .ThenBy(x => x.Nombre);
    }

    protected override MonedaEntity MapToNewEntity(
        CreateMonedaRequest request)
    {
        var entity = MonedaMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Simbolo);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateMonedaRequest request,
        MonedaEntity entity)
    {
        MonedaMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Simbolo);
    }

    protected override MonedaResponse MapToResponse(
        MonedaEntity entity)
    {
        return MonedaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<MonedaResponse>
        MapToResponseList(IEnumerable<MonedaEntity> entities)
    {
        return MonedaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateMonedaRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una moneda con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateMonedaRequest request,
        MonedaEntity entity,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Id != id &&
                 x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otra moneda con el código '{codigo}'.");
        }
    }

    protected override IQueryable<MonedaEntity> ApplySearch(
        IQueryable<MonedaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            x.Simbolo.Contains(search));
    }

    private Task DesmarcarOtrasBasesAsync(
        CancellationToken cancellationToken)
    {
        return Entities
            .Where(x => x.EsBase)
            .ExecuteUpdateAsync(
                s => s.SetProperty(x => x.EsBase, false),
                cancellationToken);
    }

    private Task DesmarcarOtrasBasesAsync(
        int excludeId,
        CancellationToken cancellationToken)
    {
        return Entities
            .Where(x => x.EsBase && x.Id != excludeId)
            .ExecuteUpdateAsync(
                s => s.SetProperty(x => x.EsBase, false),
                cancellationToken);
    }

    private static void Normalizar(
        MonedaEntity entity,
        string codigo,
        string nombre,
        string simbolo)
    {
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
        entity.Simbolo = simbolo.Trim();
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }
}