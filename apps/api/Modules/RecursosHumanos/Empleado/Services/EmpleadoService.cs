using Clinica.Api.Data;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Services;

public sealed class EmpleadoService(AppDbContext dbContext)
    : CrudService<
        EmpleadoEntity,
        CreateEmpleadoRequest,
        UpdateEmpleadoRequest,
        EmpleadoResponse
    >(dbContext)
{
    protected override IQueryable<EmpleadoEntity> BuildQuery()
    {
        return Entities
            .Include(x => x.Persona);
    }

    protected override IQueryable<EmpleadoEntity> ApplyOrder(
        IQueryable<EmpleadoEntity> query)
    {
        return query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres);
    }

    protected override EmpleadoEntity MapToNewEntity(
        CreateEmpleadoRequest request)
    {
        var entity = EmpleadoMapper.ToEntity(request);
        entity.CodigoEmpleado = NormalizarCodigo(request.CodigoEmpleado);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdateEmpleadoRequest request,
        EmpleadoEntity entity)
    {
        EmpleadoMapper.UpdateEntity(request, entity);
        entity.CodigoEmpleado = NormalizarCodigo(request.CodigoEmpleado);
    }

    protected override EmpleadoResponse MapToResponse(
        EmpleadoEntity entity)
    {
        return EmpleadoMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<EmpleadoResponse>
        MapToResponseList(IEnumerable<EmpleadoEntity> entities)
    {
        return EmpleadoMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreateEmpleadoRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarPersonaAsync(request.PersonaId, null, cancellationToken);
        await ValidarCodigoAsync(request.CodigoEmpleado, null, cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdateEmpleadoRequest request,
        EmpleadoEntity entity,
        CancellationToken cancellationToken)
    {
        await ValidarPersonaAsync(request.PersonaId, id, cancellationToken);
        await ValidarCodigoAsync(request.CodigoEmpleado, id, cancellationToken);
    }

    protected override IQueryable<EmpleadoEntity> ApplySearch(
        IQueryable<EmpleadoEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.CodigoEmpleado.Contains(search) ||
            x.Persona.Nombres.Contains(search) ||
            x.Persona.ApellidoPaterno.Contains(search) ||
            x.Persona.NumeroDocumento.Contains(search));
    }

    private async Task ValidarPersonaAsync(
        int personaId,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var existePersona = await DbContext.Set<PersonaEntity>()
            .AnyAsync(
                x => x.Id == personaId && x.Activo,
                cancellationToken);

        if (!existePersona)
            throw new NotFoundException("Persona", personaId);

        var yaEsEmpleado = excludeId is null
            ? await Entities.AnyAsync(
                x => x.PersonaId == personaId,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.PersonaId == personaId
                     && x.Id != excludeId,
                cancellationToken);

        if (yaEsEmpleado)
        {
            throw new ConflictException(
                $"La persona '{personaId}' ya está registrada como empleado.");
        }
    }

    private async Task ValidarCodigoAsync(
        string codigo,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var codigoNorm = NormalizarCodigo(codigo);

        var existe = excludeId is null
            ? await Entities.AnyAsync(
                x => x.CodigoEmpleado == codigoNorm,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.CodigoEmpleado == codigoNorm
                     && x.Id != excludeId,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un empleado con el código '{codigoNorm}'.");
        }
    }

    private static string NormalizarCodigo(string value)
    {
        return value.Trim().ToUpperInvariant();
    }
}