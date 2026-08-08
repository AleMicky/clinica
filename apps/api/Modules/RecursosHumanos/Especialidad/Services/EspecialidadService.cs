using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using EspecialidadEntity = Clinica.Api.Modules.RecursosHumanos.Especialidad.Entity.Especialidad;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Services;

public sealed class EspecialidadService(AppDbContext dbContext)
    : CrudService<
        EspecialidadEntity,
        CreateEspecialidadRequest,
        UpdateEspecialidadRequest,
        EspecialidadResponse
    >(dbContext)
{
    protected override IQueryable<EspecialidadEntity> ApplyOrder(
        IQueryable<EspecialidadEntity> query)
    {
        return query.OrderBy(x => x.Nombre);
    }

    protected override EspecialidadEntity MapToNewEntity(CreateEspecialidadRequest request)
    {
        var entity = EspecialidadMapper.ToEntity(request);

        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);

        return entity;
    }

    protected override void MapToExistingEntity(UpdateEspecialidadRequest request, EspecialidadEntity entity)
    {
        EspecialidadMapper.UpdateEntity(request, entity);
        Normalizar(
            entity,
            request.Codigo,
            request.Nombre,
            request.Descripcion);
    }

    protected override EspecialidadResponse MapToResponse(EspecialidadEntity entity)
    {
        return EspecialidadMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<EspecialidadResponse> MapToResponseList(
        IEnumerable<EspecialidadEntity> entities)
    {
        return EspecialidadMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateEspecialidadRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = NormalizarCodigo(request.Codigo);

        var existe = await Entities.AnyAsync(
            x => x.Codigo == codigo,
            cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe una especialidad con el código '{codigo}'.");
        }
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateEspecialidadRequest request,
        EspecialidadEntity entity,
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
                $"Ya existe otra especialidad con el código '{codigo}'.");
        }
    }

    protected override IQueryable<EspecialidadEntity> ApplySearch(
        IQueryable<EspecialidadEntity> query,
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
        EspecialidadEntity entity,
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
