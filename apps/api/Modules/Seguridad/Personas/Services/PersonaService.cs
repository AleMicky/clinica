using Clinica.Api.Data;
using Clinica.Api.Modules.Seguridad.Personas.Dtos;
using Clinica.Api.Modules.Seguridad.Personas.Mappers;
using Clinica.Api.Shared.Crud;
using Clinica.Api.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.Seguridad.Personas.Services;

public sealed class PersonaService(AppDbContext dbContext)
    : CrudService<
        PersonaEntity,
        CreatePersonaRequest,
        UpdatePersonaRequest,
        PersonaResponse
    >(dbContext)
{
    protected override IQueryable<PersonaEntity> ApplyOrder(
        IQueryable<PersonaEntity> query)
    {
        return query
            .OrderBy(x => x.ApellidoPaterno)
            .ThenBy(x => x.ApellidoMaterno)
            .ThenBy(x => x.Nombres);
    }

    protected override PersonaEntity MapToNewEntity(
        CreatePersonaRequest request)
    {
        var entity = PersonaMapper.ToEntity(request);
        Normalizar(entity, request);
        return entity;
    }

    protected override void MapToExistingEntity(
        UpdatePersonaRequest request,
        PersonaEntity entity)
    {
        PersonaMapper.UpdateEntity(request, entity);
        Normalizar(entity, request);
    }

    protected override PersonaResponse MapToResponse(
        PersonaEntity entity)
    {
        return PersonaMapper.ToResponse(entity);
    }

    protected override IReadOnlyCollection<PersonaResponse>
        MapToResponseList(IEnumerable<PersonaEntity> entities)
    {
        return PersonaMapper.ToResponse(entities);
    }

    protected override async Task ValidateCreateAsync(
        CreatePersonaRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarDocumentoAsync(
            request.TipoDocumento,
            request.NumeroDocumento,
            request.ComplementoDocumento,
            null,
            cancellationToken);
    }

    protected override async Task ValidateUpdateAsync(
        int id,
        UpdatePersonaRequest request,
        PersonaEntity entity,
        CancellationToken cancellationToken)
    {
        await ValidarDocumentoAsync(
            request.TipoDocumento,
            request.NumeroDocumento,
            request.ComplementoDocumento,
            id,
            cancellationToken);
    }

    protected override IQueryable<PersonaEntity> ApplySearch(
        IQueryable<PersonaEntity> query,
        string? search)
    {
        if (search is null)
            return query;

        return query.Where(x =>
            x.Nombres.Contains(search) ||
            x.ApellidoPaterno.Contains(search) ||
            x.ApellidoMaterno != null && x.ApellidoMaterno.Contains(search) ||
            x.NumeroDocumento.Contains(search));
    }

    private async Task ValidarDocumentoAsync(
        string tipoDocumento,
        string numeroDocumento,
        string? complementoDocumento,
        int? excludeId,
        CancellationToken cancellationToken)
    {
        var tipo = NormalizarTexto(tipoDocumento);
        var numero = NormalizarTexto(numeroDocumento);
        var complemento = NormalizarOpcional(complementoDocumento);

        var existe = excludeId is null
            ? await Entities.AnyAsync(
                x => x.TipoDocumento == tipo
                     && x.NumeroDocumento == numero
                     && x.ComplementoDocumento == complemento,
                cancellationToken)
            : await Entities.AnyAsync(
                x => x.Id != excludeId
                     && x.TipoDocumento == tipo
                     && x.NumeroDocumento == numero
                     && x.ComplementoDocumento == complemento,
                cancellationToken);

        if (existe)
        {
            var descripcion = complemento is null
                ? $"{tipo} {numero}"
                : $"{tipo} {numero}-{complemento}";

            throw new ConflictException(
                $"Ya existe una persona con el documento '{descripcion}'.");
        }
    }

    private static void Normalizar(
        PersonaEntity entity,
        PersonaRequest request)
    {
        entity.Nombres = NormalizarTexto(request.Nombres);
        entity.ApellidoPaterno = NormalizarTexto(request.ApellidoPaterno);
        entity.ApellidoMaterno = NormalizarOpcional(request.ApellidoMaterno);
        entity.TipoDocumento = NormalizarTexto(request.TipoDocumento);
        entity.NumeroDocumento = request.NumeroDocumento.Trim();
        entity.ComplementoDocumento =
            NormalizarOpcional(request.ComplementoDocumento);
        entity.ExtensionDocumento =
            NormalizarOpcional(request.ExtensionDocumento);
        entity.Telefono = NormalizarOpcional(request.Telefono);
        entity.Direccion = NormalizarOpcional(request.Direccion);
        entity.Genero = NormalizarOpcional(request.Genero);
        entity.EstadoCivil = NormalizarOpcional(request.EstadoCivil);
    }

    private static string NormalizarTexto(string value)
    {
        return value.Trim();
    }

    private static string? NormalizarOpcional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}