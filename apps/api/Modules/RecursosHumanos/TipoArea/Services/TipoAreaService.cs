using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Dtos;
using Clinica.Api.Modules.RecursosHumanos.TipoArea.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using TipoAreaEntity = Clinica.Api.Modules.RecursosHumanos.TipoArea.Entity.TipoArea;

namespace Clinica.Api.Modules.RecursosHumanos.TipoArea.Services;

public sealed class TipoAreaService(AppDbContext dbContext)
    : CrudService<
        TipoAreaEntity,
        CreateTipoAreaRequest,
        UpdateTipoAreaRequest,
        TipoAreaResponse
    >(dbContext)
{
    protected override IQueryable<TipoAreaEntity> ApplyOrder(
        IQueryable<TipoAreaEntity> query)
    {
        return query
            .OrderBy(x => x.Orden)
            .ThenBy(x => x.Nombre);
    }

    protected override TipoAreaEntity MapToNewEntity(
        CreateTipoAreaRequest request)
    {
        var entity = TipoAreaMapper.ToEntity(request);
        Normalizar(entity, request);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateTipoAreaRequest request,
        TipoAreaEntity entity)
    {
        TipoAreaMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);
    }

    protected override TipoAreaResponse MapToResponse(
        TipoAreaEntity entity)
    {
        return TipoAreaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<TipoAreaResponse>
        MapToResponseList(IEnumerable<TipoAreaEntity> entities)
    {
        return TipoAreaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateTipoAreaRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un tipo de área con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateTipoAreaRequest request,
        TipoAreaEntity entity,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Id != id && x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otro tipo de área con el código '{codigo}'.");
        }
    }

    protected override IQueryable<TipoAreaEntity> ApplySearch(
        IQueryable<TipoAreaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search));
    }

    private static void Normalizar(
        TipoAreaEntity entity,
        TipoAreaRequest request)
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