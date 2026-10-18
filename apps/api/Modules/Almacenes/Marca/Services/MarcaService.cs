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

    protected override async Task ValidateDeleteAsync(
        MarcaEntity entity,
        CancellationToken cancellationToken)
    {
        var tieneProductos = await DbContext.Productos
            .AnyAsync(x => x.MarcaId == entity.Id, cancellationToken);

        if (tieneProductos)
        {
            throw new ConflictException(
                $"No se puede eliminar la marca '{entity.Nombre}' porque tiene productos asociados.");
        }
    }

    public async Task<int> EliminarMultiplesAsync(
        IEnumerable<int> ids,
        CancellationToken cancellationToken = default)
    {
        var idList = ids.Distinct().ToList();
        if (idList.Count == 0)
        {
            return 0;
        }

        var entities = await Entities
            .Where(x => idList.Contains(x.Id))
            .ToListAsync(cancellationToken);

        if (entities.Count == 0)
        {
            return 0;
        }

        var idsConProductos = await DbContext.Productos
            .Where(p => p.MarcaId.HasValue && idList.Contains(p.MarcaId.Value))
            .Select(p => p.MarcaId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);

        if (idsConProductos.Count != 0)
        {
            var marcasConProductos = entities
                .Where(e => idsConProductos.Contains(e.Id))
                .Select(e => e.Nombre)
                .ToList();

            throw new ConflictException(
                $"No se pueden eliminar las siguientes marcas porque tienen productos asociados: {string.Join(", ", marcasConProductos)}");
        }

        Entities.RemoveRange(entities);
        await DbContext.SaveChangesAsync(cancellationToken);
        return entities.Count;
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
