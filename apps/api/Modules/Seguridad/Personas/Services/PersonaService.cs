using Clinica.Api.Data;
using Clinica.Api.Modules.Seguridad.Personas.Dtos;
using Clinica.Api.Modules.Seguridad.Personas.Mappers;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.Seguridad.Personas.Services;

public sealed class PersonaService(AppDbContext dbContext)
{
    public async Task<PagedResult<PersonaResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Personas
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                x.Nombres.Contains(term) ||
                x.ApellidoPaterno.Contains(term) ||
                (x.ApellidoMaterno != null &&
                 x.ApellidoMaterno.Contains(term)) ||
                x.NumeroDocumento.Contains(term));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.ApellidoPaterno)
            .ThenBy(x => x.ApellidoMaterno)
            .ThenBy(x => x.Nombres)
            .Skip(
                (pagination.ValidPage - 1) *
                pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<PersonaResponse>(
            PersonaMapper.ToResponse(items),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<PersonaResponse> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Personas
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(PersonaEntity), id);

        return PersonaMapper.ToResponse(entity);
    }

    public async Task<PersonaResponse> CrearAsync(
        CreatePersonaRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarDocumentoAsync(
            request.TipoDocumento,
            request.NumeroDocumento,
            request.ComplementoDocumento,
            null,
            cancellationToken);

        var entity = PersonaMapper.ToEntity(request);

        Normalizar(entity, request);
        entity.Activo = true;
        dbContext.Personas.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return PersonaMapper.ToResponse(entity);
    }

    public async Task<PersonaResponse> ActualizarAsync(
        int id,
        UpdatePersonaRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Personas
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(PersonaEntity), id);

        await ValidarDocumentoAsync(
            request.TipoDocumento,
            request.NumeroDocumento,
            request.ComplementoDocumento,
            id,
            cancellationToken);

        PersonaMapper.UpdateEntity(request, entity);

        Normalizar(entity, request);

        await dbContext.SaveChangesAsync(cancellationToken);

        return PersonaMapper.ToResponse(entity);
    }

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Personas
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(PersonaEntity), id);

        await ValidarEliminacionAsync(
            entity.Id,
            cancellationToken);

        dbContext.Personas.Remove(entity);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task InactivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Personas
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(PersonaEntity), id);

        if (!entity.Activo)
            return;

        entity.Activo = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Personas
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (entity is null)
            throw new NotFoundException(nameof(PersonaEntity), id);

        if (entity.Activo)
            return;

        entity.Activo = true;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarEliminacionAsync(
        int personaId,
        CancellationToken cancellationToken)
    {
        var tieneUsuario = await dbContext.Users
            .AnyAsync(
                x => x.PersonaId == personaId,
                cancellationToken);

        if (tieneUsuario)
        {
            throw new ConflictException(
                "No se puede eliminar la persona porque está asociada a un usuario.");
        }
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

        var query = dbContext.Personas
            .AsNoTracking()
            .Where(x =>
                x.TipoDocumento == tipo &&
                x.NumeroDocumento == numero &&
                x.ComplementoDocumento == complemento);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        var existe = await query.AnyAsync(cancellationToken);

        if (!existe)
            return;

        var descripcion = complemento is null
            ? $"{tipo} {numero}"
            : $"{tipo} {numero}-{complemento}";

        throw new ConflictException(
            $"Ya existe una persona con el documento '{descripcion}'.");
    }

    private static void Normalizar(
        PersonaEntity entity,
        PersonaRequest request)
    {
        entity.Nombres = NormalizarTexto(request.Nombres);
        entity.ApellidoPaterno = NormalizarTexto(request.ApellidoPaterno);
        entity.ApellidoMaterno = NormalizarOpcional(request.ApellidoMaterno);
        entity.TipoDocumento = NormalizarTexto(request.TipoDocumento);
        entity.NumeroDocumento = NormalizarTexto(request.NumeroDocumento);
        entity.ComplementoDocumento = NormalizarOpcional(request.ComplementoDocumento);
        entity.ExtensionDocumento = NormalizarOpcional(request.ExtensionDocumento);
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
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}