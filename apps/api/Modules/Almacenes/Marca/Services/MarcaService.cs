using Clinica.Api.Data;
using Clinica.Api.Modules.Almacenes.Marca.Dtos;
using Clinica.Api.Modules.Almacenes.Marca.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using MarcaEntity = Clinica.Api.Modules.Almacenes.Marca.Entity.Marca;

namespace Clinica.Api.Modules.Almacenes.Marca.Services;

public sealed class MarcaService(AppDbContext dbContext)
    : CrudService<
        MarcaEntity,
        CreateMarcaRequest,
        UpdateMarcaRequest,
        MarcaResponse
    >(dbContext)
{
    protected override IQueryable<MarcaEntity> ApplyOrder(
        IQueryable<MarcaEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override MarcaEntity MapToNewEntity(CreateMarcaRequest request)
    {
        var entity = MarcaMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(UpdateMarcaRequest request, MarcaEntity entity)
    {
        MarcaMapper.UpdateEntity(request, entity);
        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override MarcaResponse MapToResponse(MarcaEntity entity)
    {
        return MarcaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<MarcaResponse> MapToResponseList(
        IEnumerable<MarcaEntity> entities)
    {
        return MarcaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateMarcaRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una marca con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateMarcaRequest request,
        MarcaEntity entity,
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
                $"Ya existe otra marca con el código '{codigo}'.");
        }
    }

    protected override IQueryable<MarcaEntity> ApplySearch(
        IQueryable<MarcaEntity> query,
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
        MarcaEntity entity,
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
