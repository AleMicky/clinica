using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Catalogo.Dtos;
using Clinica.Api.Modules.Parametros.Catalogo.Entity;
using Clinica.Api.Modules.Parametros.Catalogo.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Parametros.Catalogo.Services;

public sealed class CatalogoGrupoService(AppDbContext dbContext)
    : CrudService<
        CatalogoGrupo,
        CreateCatalogoGrupoRequest,
        UpdateCatalogoGrupoRequest,
        CatalogoGrupoResponse
    >(dbContext)
{
    protected override IQueryable<CatalogoGrupo> ApplyOrder(
        IQueryable<CatalogoGrupo> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override CatalogoGrupo MapToNewEntity(
        CreateCatalogoGrupoRequest request)
    {
        var entity = CatalogoGrupoMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateCatalogoGrupoRequest request,
        CatalogoGrupo entity)
    {
        CatalogoGrupoMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override CatalogoGrupoResponse MapToResponse(
        CatalogoGrupo entity)
    {
        return CatalogoGrupoMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<CatalogoGrupoResponse>
        MapToResponseList(IEnumerable<CatalogoGrupo> entities)
    {
        return CatalogoGrupoMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateCatalogoGrupoRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un grupo con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateCatalogoGrupoRequest request,
        CatalogoGrupo entity,
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
                $"Ya existe otro grupo con el código '{codigo}'.");
        }
    }

    protected override IQueryable<CatalogoGrupo> ApplySearch(
        IQueryable<CatalogoGrupo> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            (x.Descripcion != null && x.Descripcion.Contains(search)));
    }

    private static void Normalizar(
        CatalogoGrupo entity,
        string codigo,
        string nombre,
        string? descripcion)
    {
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
        entity.Descripcion = Limpiar(descripcion);
    }

    private static string NormalizarCodigo(string value)
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