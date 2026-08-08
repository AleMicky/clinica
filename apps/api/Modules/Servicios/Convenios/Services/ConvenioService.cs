using Clinica.Api.Data;
using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Clinica.Api.Modules.Servicios.Convenios.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using ConvenioEntity = Clinica.Api.Modules.Servicios.Convenios.Entity.Convenio;

namespace Clinica.Api.Modules.Servicios.Convenios.Services;

public sealed class ConvenioService(AppDbContext dbContext)
    : CrudService<
        ConvenioEntity,
        CreateConvenioRequest,
        UpdateConvenioRequest,
        ConvenioResponse
    >(dbContext)
{
    protected override IQueryable<ConvenioEntity> ApplyOrder(
        IQueryable<ConvenioEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override ConvenioEntity MapToNewEntity(CreateConvenioRequest request)
    {
        var entity = ConvenioMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(UpdateConvenioRequest request, ConvenioEntity entity)
    {
        ConvenioMapper.UpdateEntity(request, entity);
        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override ConvenioResponse MapToResponse(ConvenioEntity entity)
    {
        return ConvenioMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<ConvenioResponse> MapToResponseList(
        IEnumerable<ConvenioEntity> entities)
    {
        return ConvenioMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateConvenioRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un convenio con el código '{codigo}'.");
        }

        ValidarRangoFechas(request.FechaInicio, request.FechaFin);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateConvenioRequest request,
        ConvenioEntity entity,
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
                $"Ya existe otro convenio con el código '{codigo}'.");
        }

        ValidarRangoFechas(request.FechaInicio, request.FechaFin);
    }

    protected override IQueryable<ConvenioEntity> ApplySearch(
        IQueryable<ConvenioEntity> query,
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
        ConvenioEntity entity,
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

    private static void ValidarRangoFechas(
        DateOnly fechaInicio,
        DateOnly? fechaFin)
    {
        if (fechaFin.HasValue &&
            fechaFin.Value < fechaInicio)
        {
            throw new ConflictException(
                "La fecha de fin debe ser mayor o igual a la fecha de inicio.");
        }
    }
}
