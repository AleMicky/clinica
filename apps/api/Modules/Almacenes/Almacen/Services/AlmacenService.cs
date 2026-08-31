using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Almacen.Dtos;
using Clinica.Api.Modules.Almacenes.Almacen.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;

namespace Clinica.Api.Modules.Almacenes.Almacen.Services;

public sealed class AlmacenService(AppDbContext dbContext)
    : CrudService<
        AlmacenEntity,
        CreateAlmacenRequest,
        UpdateAlmacenRequest,
        AlmacenResponse
    >(dbContext)
{
    protected override IQueryable<AlmacenEntity> ApplyOrder(
        IQueryable<AlmacenEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override AlmacenEntity MapToNewEntity(CreateAlmacenRequest request)
    {
        var entity = AlmacenMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion,
            request.Ubicacion);

        return entity;
    }

    protected override void MapToExistingEntity(UpdateAlmacenRequest request, AlmacenEntity entity)
    {
        AlmacenMapper.UpdateEntity(request, entity);
        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion,
            request.Ubicacion);
    }

    protected override AlmacenResponse MapToResponse(AlmacenEntity entity)
    {
        return AlmacenMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<AlmacenResponse> MapToResponseList(
        IEnumerable<AlmacenEntity> entities)
    {
        return AlmacenMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateAlmacenRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un almacén con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateAlmacenRequest request,
        AlmacenEntity entity,
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
                $"Ya existe otro almacén con el código '{codigo}'.");
        }
    }

    protected override IQueryable<AlmacenEntity> ApplySearch(
        IQueryable<AlmacenEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            (x.Descripcion != null && x.Descripcion.Contains(search)) ||
            (x.Ubicacion != null && x.Ubicacion.Contains(search)));
    }

    private static void Normalizar(
        AlmacenEntity entity,
        string codigo,
        string nombre,
        string? descripcion,
        string? ubicacion)
    {
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
        entity.Descripcion = Limpiar(descripcion);
        entity.Ubicacion = Limpiar(ubicacion);
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
