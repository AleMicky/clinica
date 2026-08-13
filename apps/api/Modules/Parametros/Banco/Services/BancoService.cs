using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Parametros.Banco.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Parametros.Banco.Services;

public sealed class BancoService(AppDbContext dbContext)
    : CrudService<
        Entity.Banco,
        CreateBancoRequest,
        UpdateBancoRequest,
        BancoResponse
    >(dbContext)
{
    protected override IQueryable<Entity.Banco> ApplyOrder(
        IQueryable<Entity.Banco> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override Entity.Banco MapToNewEntity(
        CreateBancoRequest request)
    {
        var entity = BancoMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.NombreCorto);

        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateBancoRequest request,
        Entity.Banco entity)
    {
        BancoMapper.UpdateEntity(request, entity);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.NombreCorto);
    }

    protected override BancoResponse MapToResponse(
        Entity.Banco entity)
    {
        return BancoMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<BancoResponse>
        MapToResponseList(IEnumerable<Entity.Banco> entities)
    {
        return BancoMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateBancoRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un banco con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateBancoRequest request,
        Entity.Banco entity,
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
                $"Ya existe otro banco con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateDeleteAsync(
        Entity.Banco entity,
        CancellationToken cancellationToken)
    {
        var tieneCuentas = await DbContext.CuentasBancarias
            .AnyAsync(x => x.BancoId == entity.Id, cancellationToken);

        if (tieneCuentas)
        {
            throw new ConflictException(
                "No se puede eliminar el banco porque tiene cuentas bancarias asociadas.");
        }
    }

    protected override async Task ValidateDeactivateAsync(
        Entity.Banco entity,
        CancellationToken cancellationToken)
    {
        var tieneCuentas = await DbContext.CuentasBancarias
            .AnyAsync(x => x.BancoId == entity.Id && x.Activo, cancellationToken);

        if (tieneCuentas)
        {
            throw new ConflictException(
                "No se puede inactivar el banco porque tiene cuentas bancarias activas.");
        }
    }

    protected override IQueryable<Entity.Banco> ApplySearch(
        IQueryable<Entity.Banco> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Codigo.Contains(search) ||
            x.Nombre.Contains(search) ||
            (x.NombreCorto != null && x.NombreCorto.Contains(search)));
    }

    private static void Normalizar(
        Entity.Banco entity,
        string codigo,
        string nombre,
        string? nombreCorto)
    {
        entity.Codigo = NormalizarCodigo(codigo);
        entity.Nombre = nombre.Trim();
        entity.NombreCorto = Limpiar(nombreCorto);
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
