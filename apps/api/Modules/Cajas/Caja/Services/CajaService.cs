using Clinica.Api.Data;
using Clinica.Api.Modules.Cajas.Caja.Dtos;
using Clinica.Api.Modules.Cajas.Caja.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using CajaEntity = Clinica.Api.Modules.Cajas.Caja.Entity.Caja;

namespace Clinica.Api.Modules.Cajas.Caja.Services;

public sealed class CajaService(AppDbContext dbContext)
    : CrudService<
        CajaEntity,
        CreateCajaRequest,
        UpdateCajaRequest,
        CajaResponse
    >(dbContext)
{
    protected override IQueryable<CajaEntity> ApplyOrder(
        IQueryable<CajaEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override CajaEntity MapToNewEntity(
        CreateCajaRequest request)
    {
        var entity = CajaMapper.ToEntity(request);
        Normalizar(entity, request);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateCajaRequest request,
        CajaEntity entity)
    {
        CajaMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);
    }

    protected override CajaResponse MapToResponse(
        CajaEntity entity)
    {
        return CajaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<CajaResponse>
        MapToResponseList(IEnumerable<CajaEntity> entities)
    {
        return CajaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateCajaRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una caja con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateCajaRequest request,
        CajaEntity entity,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Id != id && x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe otra caja con el código '{codigo}'.");
        }
    }

    protected override IQueryable<CajaEntity> ApplySearch(
        IQueryable<CajaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search));
    }

    private static void Normalizar(
        CajaEntity entity,
        CajaRequest request)
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
