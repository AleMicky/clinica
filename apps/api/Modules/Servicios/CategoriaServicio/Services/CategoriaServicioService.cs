using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Dtos;
using Clinica.Api.Modules.Servicios.CategoriaServicio.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using CategoriaServicioEntity = Clinica.Api.Modules.Servicios.CategoriaServicio.Entity.CategoriaServicio;

namespace Clinica.Api.Modules.Servicios.CategoriaServicio.Services;

public sealed class CategoriaServicioService(AppDbContext dbContext)
    : CrudService<
        CategoriaServicioEntity,
        CreateCategoriaServicioRequest,
        UpdateCategoriaServicioRequest,
        CategoriaServicioResponse
    >(dbContext)
{
    protected override IQueryable<CategoriaServicioEntity> ApplyOrder(
        IQueryable<CategoriaServicioEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override CategoriaServicioEntity MapToNewEntity(CreateCategoriaServicioRequest request)
    {
        var entity = CategoriaServicioMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(UpdateCategoriaServicioRequest request, CategoriaServicioEntity entity)
    {
        CategoriaServicioMapper.UpdateEntity(request, entity);
        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override CategoriaServicioResponse MapToResponse(CategoriaServicioEntity entity)
    {
        return CategoriaServicioMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<CategoriaServicioResponse> MapToResponseList(
        IEnumerable<CategoriaServicioEntity> entities)
    {
        return CategoriaServicioMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateCategoriaServicioRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una categoría con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateCategoriaServicioRequest request,
        CategoriaServicioEntity entity,
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
                $"Ya existe otra categoría con el código '{codigo}'.");
        }
    }

    protected override IQueryable<CategoriaServicioEntity> ApplySearch(
        IQueryable<CategoriaServicioEntity> query,
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
        CategoriaServicioEntity entity,
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
