using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Services;

public sealed class UnidadesMedidaService(AppDbContext dbContext)
    : CrudService<
        Entity.UnidadesMedida,
        CreateUnidadesMedidaRequest,
        UpdateUnidadesMedidaRequest,
        UnidadesMedidaResponse
    >(dbContext)
{
    protected override IQueryable<Entity.UnidadesMedida> ApplyOrder(
        IQueryable<Entity.UnidadesMedida> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override Entity.UnidadesMedida MapToNewEntity(
        CreateUnidadesMedidaRequest request)
    {
        var entity = UnidadesMedidaMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Categoria,
            request.Codigo,
            request.Nombre,
            request.Simbolo);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateUnidadesMedidaRequest request,
        Entity.UnidadesMedida entity)
    {
        UnidadesMedidaMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Categoria,
            request.Codigo,
            request.Nombre,
            request.Simbolo);
    }

    protected override UnidadesMedidaResponse MapToResponse(
        Entity.UnidadesMedida entity)
    {
        return UnidadesMedidaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<UnidadesMedidaResponse>
        MapToResponseList(IEnumerable<Entity.UnidadesMedida> entities)
    {
        return UnidadesMedidaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateUnidadesMedidaRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una unidad de medida con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateUnidadesMedidaRequest request,
        Entity.UnidadesMedida entity,
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
                $"Ya existe otra unidad de medida con el código '{codigo}'.");
        }
    }

    protected override IQueryable<Entity.UnidadesMedida> ApplySearch(
        IQueryable<Entity.UnidadesMedida> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Categoria.Contains(search) ||
            x.Nombre.Contains(search) ||
            x.Simbolo.Contains(search));
    }

    private static void Normalizar(
        Entity.UnidadesMedida entity,
        string categoria,
        string codigo,
        string nombre,
        string simbolo)
    {
        entity.Categoria = categoria.Trim();
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
        entity.Simbolo = simbolo.Trim();
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }
}