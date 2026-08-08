using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using Clinica.Api.Modules.Parametros.MetodoPago.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Parametros.MetodoPago.Services;

public sealed class MetodoPagoService(AppDbContext dbContext)
    : CrudService<
        Entity.MetodoPago,
        CreateMetodoPagoRequest,
        UpdateMetodoPagoRequest,
        MetodoPagoResponse
    >(dbContext)
{
    protected override IQueryable<Entity.MetodoPago> ApplyOrder(
        IQueryable<Entity.MetodoPago> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override Entity.MetodoPago MapToNewEntity(
        CreateMetodoPagoRequest request)
    {
        var entity = MetodoPagoMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateMetodoPagoRequest request,
        Entity.MetodoPago entity)
    {
        MetodoPagoMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre);
    }

    protected override MetodoPagoResponse MapToResponse(
        Entity.MetodoPago entity)
    {
        return MetodoPagoMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<MetodoPagoResponse>
        MapToResponseList(IEnumerable<Entity.MetodoPago> entities)
    {
        return MetodoPagoMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateMetodoPagoRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un método de pago con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateMetodoPagoRequest request,
        Entity.MetodoPago entity,
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
                $"Ya existe otro método de pago con el código '{codigo}'.");
        }
    }

    protected override IQueryable<Entity.MetodoPago> ApplySearch(
        IQueryable<Entity.MetodoPago> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search));
    }

    private static void Normalizar(
        Entity.MetodoPago entity,
        string codigo,
        string nombre)
    {
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }
}
